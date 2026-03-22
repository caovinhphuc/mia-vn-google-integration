/**
 * ChartRenderer - Chart and data visualization components
 * Supports various chart types for warehouse analytics
 */

import React, { useEffect, useRef } from 'react';
import logger from "../../../../utils/logger";

// Chart Types
export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  DONUT: 'donut',
  AREA: 'area',
  HEATMAP: 'heatmap'
};

/**
 * Simple SVG Chart Renderer
 */
export class ChartRenderer {
  constructor(container, config = {}) {
    this.container = container;
    this.config = {
      width: 400,
      height: 300,
      padding: { top: 20, right: 20, bottom: 40, left: 60 },
      backgroundColor: '#ffffff',
      gridColor: '#e9ecef',
      textColor: '#495057',
      primaryColor: '#007bff',
      colors: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'],
      ...config
    };

    this.svg = null;
    this.data = [];
    this.chartType = CHART_TYPES.BAR;

    this.initialize();
  }

  initialize() {
    this.createSVG();
    logger.info('[ChartRenderer] Initialized');
  }

  createSVG() {
    this.container.innerHTML = '';

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.config.width);
    this.svg.setAttribute('height', this.config.height);
    this.svg.style.backgroundColor = this.config.backgroundColor;
    this.svg.style.border = '1px solid #dee2e6';
    this.svg.style.borderRadius = '8px';

    this.container.appendChild(this.svg);
  }

  render(data, type = CHART_TYPES.BAR) {
    this.data = data;
    this.chartType = type;

    // Clear previous content
    this.svg.innerHTML = '';

    switch (type) {
      case CHART_TYPES.BAR:
        this.renderBarChart();
        break;
      case CHART_TYPES.LINE:
        this.renderLineChart();
        break;
      case CHART_TYPES.PIE:
        this.renderPieChart();
        break;
      case CHART_TYPES.DONUT:
        this.renderDonutChart();
        break;
      default:
        logger.warn('[ChartRenderer] Unknown chart type:', type);
    }
  }

  renderBarChart() {
    const { width, height, padding } = this.config;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (!this.data || this.data.length === 0) return;

    // Calculate scales
    const maxValue = Math.max(...this.data.map(d => d.value));
    const barWidth = chartWidth / this.data.length * 0.8;
    const barSpacing = chartWidth / this.data.length * 0.2;

    // Create chart group
    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${padding.left}, ${padding.top})`);

    // Render bars
    this.data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = index * (barWidth + barSpacing);
      const y = chartHeight - barHeight;

      // Bar
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', barHeight);
      rect.setAttribute('fill', this.config.colors[index % this.config.colors.length]);
      rect.setAttribute('rx', '4');
      chartGroup.appendChild(rect);

      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + barWidth / 2);
      text.setAttribute('y', chartHeight + 15);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', this.config.textColor);
      text.textContent = item.label;
      chartGroup.appendChild(text);

      // Value label
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueText.setAttribute('x', x + barWidth / 2);
      valueText.setAttribute('y', y - 5);
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('font-size', '10');
      valueText.setAttribute('fill', this.config.textColor);
      valueText.textContent = item.value;
      chartGroup.appendChild(valueText);
    });

    this.svg.appendChild(chartGroup);
  }

  renderLineChart() {
    const { width, height, padding } = this.config;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (!this.data || this.data.length === 0) return;

    const maxValue = Math.max(...this.data.map(d => d.value));
    const stepX = chartWidth / (this.data.length - 1);

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${padding.left}, ${padding.top})`);

    // Create path
    let pathData = '';
    this.data.forEach((item, index) => {
      const x = index * stepX;
      const y = chartHeight - (item.value / maxValue) * chartHeight;

      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }

      // Add point circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', this.config.primaryColor);
      chartGroup.appendChild(circle);
    });

    // Add path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', this.config.primaryColor);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    chartGroup.appendChild(path);

    this.svg.appendChild(chartGroup);
  }

  renderPieChart() {
    const { width, height } = this.config;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    if (!this.data || this.data.length === 0) return;

    const total = this.data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    this.data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;

      const x1 = centerX + radius * Math.cos(currentAngle);
      const y1 = centerY + radius * Math.sin(currentAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', this.config.colors[index % this.config.colors.length]);
      path.setAttribute('stroke', '#ffffff');
      path.setAttribute('stroke-width', '2');

      chartGroup.appendChild(path);

      currentAngle = endAngle;
    });

    this.svg.appendChild(chartGroup);
  }

  renderDonutChart() {
    // Similar to pie chart but with inner radius
    // TODO: Implement donut chart
    logger.info('[ChartRenderer] Donut chart not implemented yet');
  }

  updateData(newData) {
    this.render(newData, this.chartType);
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

/**
 * React wrapper for ChartRenderer
 */
export function Chart({ data, type = CHART_TYPES.BAR, config = {}, className = '' }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      if (rendererRef.current) {
        rendererRef.current.destroy();
      }

      rendererRef.current = new ChartRenderer(containerRef.current, config);
      if (data && data.length > 0) {
        rendererRef.current.render(data, type);
      }
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
      }
    };
  }, [config, data, type]);

  useEffect(() => {
    if (rendererRef.current && data) {
      rendererRef.current.render(data, type);
    }
  }, [data, type]);

  return (
    <div
      ref={containerRef}
      className={`chart-container ${className}`}
      style={{ display: 'inline-block' }}
    />
  );
}

// Predefined chart components
export function BarChart({ data, config = {}, className = '' }) {
  return <Chart data={data} type={CHART_TYPES.BAR} config={config} className={className} />;
}

export function LineChart({ data, config = {}, className = '' }) {
  return <Chart data={data} type={CHART_TYPES.LINE} config={config} className={className} />;
}

export function PieChart({ data, config = {}, className = '' }) {
  return <Chart data={data} type={CHART_TYPES.PIE} config={config} className={className} />;
}

export function DonutChart({ data, config = {}, className = '' }) {
  return <Chart data={data} type={CHART_TYPES.DONUT} config={config} className={className} />;
}

export default Chart;
