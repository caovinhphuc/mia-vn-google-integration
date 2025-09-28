# =============================================================================
# ONE AUTOMATION SYSTEM - OPTIMIZED DOCKERFILE FOR PRODUCTION
# =============================================================================

FROM python:3.11-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies for building
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  unzip \
  curl \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  unzip \
  curl \
  xvfb \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libxss1 \
  libnss3 \
  && rm -rf /var/lib/apt/lists/*

# Install Google Chrome (latest stable)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
  && apt-get update \
  && apt-get install -y google-chrome-stable \
  && rm -rf /var/lib/apt/lists/*

# Install ChromeDriver (latest)
RUN CHROMEDRIVER_VERSION=$(curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE) \
  && wget -N http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip \
  && unzip chromedriver_linux64.zip \
  && rm chromedriver_linux64.zip \
  && mv chromedriver /usr/local/bin/ \
  && chmod +x /usr/local/bin/chromedriver

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p data logs reports config backups

# Set permissions
RUN chmod +x setup.sh deploy.sh quick_run.sh quick_config.sh

# Create non-root user for security
RUN useradd -m -u 1000 automation \
  && chown -R automation:automation /app

# Switch to non-root user
USER automation

# Set environment variables
ENV PYTHONPATH=/app
ENV PATH=/root/.local/bin:$PATH
ENV HEADLESS=true
ENV TZ=Asia/Ho_Chi_Minh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import os; exit(0 if os.path.exists('/app/logs/automation.log') else 1)" || exit 1

# Expose port for web interface
EXPOSE 8000

# Default command
CMD ["python", "automation.py", "--schedule"]
