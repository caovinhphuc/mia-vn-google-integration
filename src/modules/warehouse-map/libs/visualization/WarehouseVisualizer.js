import logger from "../../../../utils/logger";
/**
 * WarehouseVisualizer - Interactive warehouse map visualization library
 * Handles 2D/3D warehouse layout rendering and interactions
 */

export class WarehouseVisualizer {
  constructor(container, config = {}) {
    this.container = container;
    this.config = {
      width: 800,
      height: 600,
      padding: 20,
      gridSize: 50,
      enableZoom: true,
      enablePan: true,
      enableSelection: true,
      renderMode: '2d', // '2d' or '3d'
      backgroundColor: '#f8f9fa',
      gridColor: '#e9ecef',
      ...config
    };

    this.svg = null;
    this.canvas = null;
    this.zoom = null;
    this.scale = 1;
    this.offset = { x: 0, y: 0 };
    this.selectedElements = new Set();
    this.hoveredElement = null;

    this.eventHandlers = new Map();

    this.initialize();
  }

  /**
   * Initialize the visualizer
   */
  initialize() {
    this.createSVGCanvas();
    this.setupInteractions();
    this.render();
    logger.info('[WarehouseVisualizer] Initialized');
  }

  /**
   * Create SVG canvas for 2D rendering
   */
  createSVGCanvas() {
    // Clear existing content
    this.container.innerHTML = '';

    // Create SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.config.width);
    this.svg.setAttribute('height', this.config.height);
    this.svg.style.backgroundColor = this.config.backgroundColor;
    this.svg.style.border = '1px solid #dee2e6';
    this.svg.style.borderRadius = '8px';

    // Create main group for transformations
    this.mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svg.appendChild(this.mainGroup);

    // Add to container
    this.container.appendChild(this.svg);
  }

  /**
   * Setup zoom, pan, and interaction handlers
   */
  setupInteractions() {
    if (!this.config.enableZoom && !this.config.enablePan) return;

    let isDragging = false;
    let lastPoint = { x: 0, y: 0 };

    // Mouse events
    this.svg.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        isDragging = true;
        lastPoint = { x: e.clientX, y: e.clientY };
        this.svg.style.cursor = 'grabbing';
      }
    });

    this.svg.addEventListener('mousemove', (e) => {
      if (isDragging && this.config.enablePan) {
        const dx = e.clientX - lastPoint.x;
        const dy = e.clientY - lastPoint.y;

        this.offset.x += dx;
        this.offset.y += dy;

        this.updateTransform();

        lastPoint = { x: e.clientX, y: e.clientY };
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        this.svg.style.cursor = 'default';
      }
    });

    // Zoom with mouse wheel
    if (this.config.enableZoom) {
      this.svg.addEventListener('wheel', (e) => {
        e.preventDefault();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(5, this.scale * delta));

        if (newScale !== this.scale) {
          this.scale = newScale;
          this.updateTransform();
          this.emit('zoom', { scale: this.scale });
        }
      });
    }
  }

  /**
   * Update SVG transform
   */
  updateTransform() {
    this.mainGroup.setAttribute('transform',
      `translate(${this.offset.x}, ${this.offset.y}) scale(${this.scale})`
    );
  }

  /**
   * Render the warehouse layout
   */
  render(data = {}) {
    this.clearCanvas();
    this.renderGrid();
    this.renderZones(data.zones || []);
    this.renderLocations(data.locations || []);
    this.renderConnections(data.connections || []);

    logger.info('[WarehouseVisualizer] Rendered warehouse layout');
  }

  /**
   * Clear the canvas
   */
  clearCanvas() {
    while (this.mainGroup.firstChild) {
      this.mainGroup.removeChild(this.mainGroup.firstChild);
    }
  }

  /**
   * Render background grid
   */
  renderGrid() {
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridGroup.setAttribute('class', 'grid');

    const { width, height, gridSize } = this.config;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', 0);
      line.setAttribute('x2', x);
      line.setAttribute('y2', height);
      line.setAttribute('stroke', this.config.gridColor);
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', 0);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', this.config.gridColor);
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);
    }

    this.mainGroup.appendChild(gridGroup);
  }

  /**
   * Render warehouse zones
   */
  renderZones(zones) {
    const zoneGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    zoneGroup.setAttribute('class', 'zones');

    zones.forEach(zone => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', zone.x || 0);
      rect.setAttribute('y', zone.y || 0);
      rect.setAttribute('width', zone.width || 100);
      rect.setAttribute('height', zone.height || 100);
      rect.setAttribute('fill', zone.color || '#e3f2fd');
      rect.setAttribute('stroke', zone.borderColor || '#1976d2');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('opacity', '0.3');
      rect.setAttribute('rx', '8');
      rect.setAttribute('data-zone-id', zone.id);
      rect.style.cursor = 'pointer';

      // Add zone label
      if (zone.name) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (zone.x || 0) + (zone.width || 100) / 2);
        text.setAttribute('y', (zone.y || 0) + 20);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#1976d2');
        text.textContent = zone.name;
        zoneGroup.appendChild(text);
      }

      // Add event listeners
      this.addElementEventListeners(rect, 'zone', zone);

      zoneGroup.appendChild(rect);
    });

    this.mainGroup.appendChild(zoneGroup);
  }

  /**
   * Render warehouse locations
   */
  renderLocations(locations) {
    const locationGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    locationGroup.setAttribute('class', 'locations');

    locations.forEach(location => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('data-location-id', location.id);

      // Location rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', location.x || 0);
      rect.setAttribute('y', location.y || 0);
      rect.setAttribute('width', location.width || 40);
      rect.setAttribute('height', location.height || 40);
      rect.setAttribute('fill', this.getLocationColor(location));
      rect.setAttribute('stroke', '#333');
      rect.setAttribute('stroke-width', '1');
      rect.setAttribute('rx', '4');
      rect.style.cursor = 'pointer';

      // Location label
      if (location.code) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (location.x || 0) + (location.width || 40) / 2);
        text.setAttribute('y', (location.y || 0) + (location.height || 40) / 2 + 4);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', '#333');
        text.textContent = location.code;
        group.appendChild(text);
      }

      // Add event listeners
      this.addElementEventListeners(rect, 'location', location);

      group.appendChild(rect);
      locationGroup.appendChild(group);
    });

    this.mainGroup.appendChild(locationGroup);
  }

  /**
   * Render connections between locations
   */
  renderConnections(connections) {
    const connectionGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    connectionGroup.setAttribute('class', 'connections');

    connections.forEach(connection => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', connection.x1 || 0);
      line.setAttribute('y1', connection.y1 || 0);
      line.setAttribute('x2', connection.x2 || 0);
      line.setAttribute('y2', connection.y2 || 0);
      line.setAttribute('stroke', connection.color || '#666');
      line.setAttribute('stroke-width', connection.width || '2');
      line.setAttribute('stroke-dasharray', connection.dashed ? '5,5' : 'none');

      connectionGroup.appendChild(line);
    });

    this.mainGroup.appendChild(connectionGroup);
  }

  /**
   * Get color for location based on status and occupancy
   */
  getLocationColor(location) {
    const colors = {
      empty: '#f8f9fa',
      occupied: '#28a745',
      reserved: '#ffc107',
      maintenance: '#dc3545',
      overflow: '#fd7e14'
    };

    return colors[location.status] || colors.empty;
  }

  /**
   * Add event listeners to elements
   */
  addElementEventListeners(element, type, data) {
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleElementClick(type, data, e);
    });

    element.addEventListener('mouseenter', (e) => {
      this.handleElementHover(type, data, e, true);
    });

    element.addEventListener('mouseleave', (e) => {
      this.handleElementHover(type, data, e, false);
    });
  }

  /**
   * Handle element click
   */
  handleElementClick(type, data, event) {
    if (this.config.enableSelection) {
      this.selectElement(type, data);
      this.emit('elementClick', { type, data, event });
    }
  }

  /**
   * Handle element hover
   */
  handleElementHover(type, data, event, isEntering) {
    if (isEntering) {
      this.hoveredElement = { type, data };
      this.emit('elementHover', { type, data, event, isEntering });
    } else {
      this.hoveredElement = null;
      this.emit('elementHover', { type, data, event, isEntering });
    }
  }

  /**
   * Select an element
   */
  selectElement(type, data) {
    this.selectedElements.clear();
    this.selectedElements.add({ type, data });
    this.emit('selectionChange', Array.from(this.selectedElements));
  }

  /**
   * Event system
   */
  on(event, callback) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(callback);
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Zoom controls
   */
  zoomIn() {
    this.scale = Math.min(5, this.scale * 1.2);
    this.updateTransform();
    this.emit('zoom', { scale: this.scale });
  }

  zoomOut() {
    this.scale = Math.max(0.1, this.scale * 0.8);
    this.updateTransform();
    this.emit('zoom', { scale: this.scale });
  }

  resetZoom() {
    this.scale = 1;
    this.offset = { x: 0, y: 0 };
    this.updateTransform();
    this.emit('zoom', { scale: this.scale });
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.render();
  }

  /**
   * Destroy the visualizer
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.eventHandlers.clear();
    logger.info('[WarehouseVisualizer] Destroyed');
  }
}

export default WarehouseVisualizer;
