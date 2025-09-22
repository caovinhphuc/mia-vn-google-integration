#!/bin/bash

# =============================================================================
# ONE AUTOMATION SYSTEM - MONITORING SCRIPT
# =============================================================================

set -euo pipefail

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="${SCRIPT_DIR}/logs/monitor.log"
readonly ALERT_EMAIL="${ALERT_EMAIL:-}"
readonly SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

# Logging
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case "$level" in
        INFO)  echo -e "${GREEN}[INFO]${NC} $message" ;;
        WARN)  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        ERROR) echo -e "${RED}[ERROR]${NC} $message" ;;
        DEBUG) echo -e "${CYAN}[DEBUG]${NC} $message" ;;
    esac

    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Check if automation process is running
check_automation_process() {
    local process_count=$(pgrep -f "python.*automation.py" | wc -l)

    if [[ $process_count -eq 0 ]]; then
        log ERROR "Automation process not running"
        return 1
    elif [[ $process_count -gt 1 ]]; then
        log WARN "Multiple automation processes running ($process_count)"
        return 1
    else
        log INFO "Automation process is running (PID: $(pgrep -f "python.*automation.py"))"
        return 0
    fi
}

# Check Docker containers
check_docker_containers() {
    if ! command -v docker &> /dev/null; then
        return 0
    fi

    local containers=("one-automation-system" "one-automation-web" "one-automation-monitor")
    local failed_containers=()

    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "^${container}$"; then
            local status=$(docker inspect --format='{{.State.Status}}' "$container")
            if [[ "$status" == "running" ]]; then
                log INFO "Container $container is running"
            else
                log ERROR "Container $container is not running (status: $status)"
                failed_containers+=("$container")
            fi
        else
            log WARN "Container $container not found"
        fi
    done

    if [[ ${#failed_containers[@]} -gt 0 ]]; then
        return 1
    fi
    return 0
}

# Check disk space
check_disk_space() {
    local threshold=90
    local usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')

    if [[ $usage -gt $threshold ]]; then
        log ERROR "Disk usage is high: ${usage}%"
        return 1
    else
        log INFO "Disk usage is normal: ${usage}%"
        return 0
    fi
}

# Check memory usage
check_memory_usage() {
    local threshold=90
    local usage

    if command -v free &> /dev/null; then
        usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    elif command -v vm_stat &> /dev/null; then
        # macOS
        local pages_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        local pages_active=$(vm_stat | grep "Pages active" | awk '{print $3}' | sed 's/\.//')
        local pages_inactive=$(vm_stat | grep "Pages inactive" | awk '{print $3}' | sed 's/\.//')
        local pages_speculative=$(vm_stat | grep "Pages speculative" | awk '{print $3}' | sed 's/\.//')
        local pages_wired=$(vm_stat | grep "Pages wired down" | awk '{print $4}' | sed 's/\.//')

        local total_pages=$((pages_free + pages_active + pages_inactive + pages_speculative + pages_wired))
        local used_pages=$((pages_active + pages_inactive + pages_speculative + pages_wired))
        usage=$((used_pages * 100 / total_pages))
    else
        log WARN "Cannot check memory usage (free/vm_stat not available)"
        return 0
    fi

    if [[ $usage -gt $threshold ]]; then
        log ERROR "Memory usage is high: ${usage}%"
        return 1
    else
        log INFO "Memory usage is normal: ${usage}%"
        return 0
    fi
}

# Check log file size
check_log_size() {
    local max_size=104857600  # 100MB
    local log_file="${SCRIPT_DIR}/logs/automation.log"

    if [[ -f "$log_file" ]]; then
        local size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null)
        if [[ $size -gt $max_size ]]; then
            log WARN "Log file is large: $((size / 1024 / 1024))MB"
            return 1
        else
            log INFO "Log file size is normal: $((size / 1024 / 1024))MB"
        fi
    else
        log WARN "Log file not found: $log_file"
        return 1
    fi
    return 0
}

# Check recent errors in logs
check_recent_errors() {
    local log_file="${SCRIPT_DIR}/logs/automation.log"
    local error_count=0

    if [[ -f "$log_file" ]]; then
        # Check for errors in last 100 lines
        error_count=$(tail -100 "$log_file" | grep -i "error\|exception\|failed\|critical" | wc -l)

        if [[ $error_count -gt 5 ]]; then
            log ERROR "High error count in recent logs: $error_count"
            return 1
        elif [[ $error_count -gt 0 ]]; then
            log WARN "Some errors in recent logs: $error_count"
        else
            log INFO "No recent errors in logs"
        fi
    else
        log WARN "Log file not found for error checking"
        return 1
    fi
    return 0
}

# Check data directory
check_data_directory() {
    local data_dir="${SCRIPT_DIR}/data"
    local report_count=0
    local data_count=0

    if [[ -d "$data_dir" ]]; then
        data_count=$(find "$data_dir" -type f | wc -l)
        report_count=$(find "${SCRIPT_DIR}/reports" -type f 2>/dev/null | wc -l)

        log INFO "Data directory has $data_count files"
        log INFO "Reports directory has $report_count files"

        if [[ $data_count -eq 0 ]]; then
            log WARN "No data files found"
            return 1
        fi
    else
        log ERROR "Data directory not found"
        return 1
    fi
    return 0
}

# Check network connectivity
check_network() {
    local test_urls=("https://one.tga.com.vn" "https://google.com")
    local failed_urls=()

    for url in "${test_urls[@]}"; do
        if curl -s --max-time 10 "$url" > /dev/null; then
            log INFO "Network connectivity to $url: OK"
        else
            log ERROR "Network connectivity to $url: FAILED"
            failed_urls+=("$url")
        fi
    done

    if [[ ${#failed_urls[@]} -gt 0 ]]; then
        return 1
    fi
    return 0
}

# Send alert
send_alert() {
    local message="$1"
    local level="$2"

    # Email alert
    if [[ -n "$ALERT_EMAIL" ]] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "[ONE Automation] $level Alert" "$ALERT_EMAIL"
        log INFO "Alert sent via email to $ALERT_EMAIL"
    fi

    # Slack alert
    if [[ -n "$SLACK_WEBHOOK" ]] && command -v curl &> /dev/null; then
        local color="good"
        case "$level" in
            ERROR) color="danger" ;;
            WARN)  color="warning" ;;
        esac

        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\", \"color\":\"$color\"}" \
            "$SLACK_WEBHOOK" > /dev/null 2>&1
        log INFO "Alert sent via Slack"
    fi
}

# Generate system report
generate_report() {
    local report_file="${SCRIPT_DIR}/reports/system_report_$(date +%Y%m%d_%H%M%S).txt"

    {
        echo "ONE Automation System - System Report"
        echo "Generated: $(date)"
        echo "======================================"
        echo ""

        echo "System Information:"
        echo "  Hostname: $(hostname)"
        echo "  Uptime: $(uptime)"
        echo "  Load Average: $(uptime | awk -F'load average:' '{print $2}')"
        echo ""

        echo "Disk Usage:"
        df -h .
        echo ""

        echo "Memory Usage:"
        if command -v free &> /dev/null; then
            free -h
        elif command -v vm_stat &> /dev/null; then
            vm_stat
        fi
        echo ""

        echo "Process Status:"
        pgrep -f "python.*automation.py" && echo "Automation process: RUNNING" || echo "Automation process: NOT RUNNING"
        echo ""

        echo "Docker Containers:"
        if command -v docker &> /dev/null; then
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        else
            echo "Docker not available"
        fi
        echo ""

        echo "Recent Log Entries (last 10):"
        if [[ -f "${SCRIPT_DIR}/logs/automation.log" ]]; then
            tail -10 "${SCRIPT_DIR}/logs/automation.log"
        else
            echo "Log file not found"
        fi

    } > "$report_file"

    log INFO "System report generated: $report_file"
}

# Main monitoring function
main() {
    local overall_status=0
    local failed_checks=()

    log INFO "Starting system monitoring..."

    # Run all checks
    check_automation_process || { overall_status=1; failed_checks+=("automation_process") }
    check_docker_containers || { overall_status=1; failed_checks+=("docker_containers") }
    check_disk_space || { overall_status=1; failed_checks+=("disk_space") }
    check_memory_usage || { overall_status=1; failed_checks+=("memory_usage") }
    check_log_size || { overall_status=1; failed_checks+=("log_size") }
    check_recent_errors || { overall_status=1; failed_checks+=("recent_errors") }
    check_data_directory || { overall_status=1; failed_checks+=("data_directory") }
    check_network || { overall_status=1; failed_checks+=("network") }

    # Generate report
    generate_report

    # Summary
    if [[ $overall_status -eq 0 ]]; then
        log INFO "All system checks passed"
    else
        log ERROR "System check failed. Failed checks: ${failed_checks[*]}"

        # Send alert for critical failures
        if [[ " ${failed_checks[*]} " =~ " automation_process " ]] || \
           [[ " ${failed_checks[*]} " =~ " disk_space " ]] || \
           [[ " ${failed_checks[*]} " =~ " memory_usage " ]]; then
            send_alert "Critical system check failures: ${failed_checks[*]}" "ERROR"
        fi
    fi

    log INFO "Monitoring completed"
    exit $overall_status
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --report       Generate system report only"
        echo "  --check        Run specific check"
        echo ""
        echo "Environment Variables:"
        echo "  ALERT_EMAIL    Email address for alerts"
        echo "  SLACK_WEBHOOK  Slack webhook URL for alerts"
        echo ""
        exit 0
        ;;
    --report)
        generate_report
        exit 0
        ;;
    --check)
        case "${2:-}" in
            process) check_automation_process ;;
            docker)  check_docker_containers ;;
            disk)    check_disk_space ;;
            memory)  check_memory_usage ;;
            logs)    check_log_size ;;
            errors)  check_recent_errors ;;
            data)    check_data_directory ;;
            network) check_network ;;
            *)       echo "Unknown check: ${2:-}"; exit 1 ;;
        esac
        exit $?
        ;;
esac

# Run main function
main "$@"
