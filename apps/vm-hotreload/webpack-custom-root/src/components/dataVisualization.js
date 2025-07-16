// Data Visualization component for charts and graphs
const Logger = require('../utils/logger');
const Metrics = require('../utils/metrics');

class DataVisualization {
  constructor(type = 'chart') {
    this.type = type;
    this.logger = new Logger(`VIZ-${type}`);
    this.metrics = new Metrics();
    this.datasets = new Map();
    this.config = {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      showLegend: true,
      showGrid: true,
      animationDuration: 300,
    };
    this.createdAt = new Date().toISOString();
    this.renderCount = 0;

    this.logger.info(`DataVisualization '${this.type}' initialized`);
    this.metrics.incrementCounter('component_created');
  }

  addDataset(name, data, options = {}) {
    const dataset = {
      name,
      data: Array.isArray(data) ? data : [],
      options: {
        color: options.color || this.generateRandomColor(),
        label: options.label || name,
        type: options.type || 'line',
        visible: options.visible !== false,
      },
      createdAt: new Date().toISOString(),
    };

    this.datasets.set(name, dataset);
    this.logger.info(
      `Dataset '${name}' added with ${dataset.data.length} points`,
    );
    this.metrics.incrementCounter('dataset_added');
    this.metrics.setGauge('total_datasets', this.datasets.size);

    return this;
  }

  updateDataset(name, data) {
    if (this.datasets.has(name)) {
      const dataset = this.datasets.get(name);
      dataset.data = Array.isArray(data) ? data : [];
      dataset.updatedAt = new Date().toISOString();

      this.logger.info(
        `Dataset '${name}' updated with ${dataset.data.length} points`,
      );
      this.metrics.incrementCounter('dataset_updated');
    } else {
      this.logger.warn(`Dataset '${name}' not found`);
    }

    return this;
  }

  removeDataset(name) {
    if (this.datasets.delete(name)) {
      this.logger.info(`Dataset '${name}' removed`);
      this.metrics.incrementCounter('dataset_removed');
      this.metrics.setGauge('total_datasets', this.datasets.size);
    } else {
      this.logger.warn(`Dataset '${name}' not found`);
    }

    return this;
  }

  setConfig(key, value) {
    if (key in this.config) {
      this.config[key] = value;
      this.logger.info(`Config updated: ${key} = ${value}`);
    } else {
      this.logger.warn(`Unknown config key: ${key}`);
    }

    return this;
  }

  getConfig(key) {
    return key ? this.config[key] : { ...this.config };
  }

  generateRandomColor() {
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
      '#C9CBCF',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  generateSampleData(count = 10) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        x: i,
        y: Math.floor(Math.random() * 100),
        label: `Point ${i + 1}`,
      });
    }
    return data;
  }

  render() {
    this.metrics.startTimer('render_time');
    this.renderCount++;

    const output = {
      type: this.type,
      config: this.getConfig(),
      datasets: Object.fromEntries(this.datasets),
      stats: {
        datasetCount: this.datasets.size,
        renderCount: this.renderCount,
        totalDataPoints: Array.from(this.datasets.values()).reduce(
          (sum, dataset) => sum + dataset.data.length,
          0,
        ),
      },
      metrics: this.metrics.getReport(),
      createdAt: this.createdAt,
      renderedAt: new Date().toISOString(),
    };

    const renderTime = this.metrics.endTimer('render_time');
    this.logger.info(
      `Rendered in ${renderTime}ms (render #${this.renderCount})`,
    );
    this.metrics.incrementCounter('render_count');

    return output;
  }

  exportData(format = 'json') {
    const data = {
      type: this.type,
      datasets: Object.fromEntries(this.datasets),
      config: this.config,
      exportedAt: new Date().toISOString(),
    };

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      default:
        this.logger.warn(`Unsupported export format: ${format}`);
        return JSON.stringify(data, null, 2);
    }
  }

  convertToCSV(data) {
    // Simple CSV conversion for demonstration
    let csv = 'Dataset,X,Y,Label\n';

    Object.entries(data.datasets).forEach(([name, dataset]) => {
      dataset.data.forEach((point) => {
        csv += `${name},${point.x || ''},${point.y || ''},${point.label || ''}\n`;
      });
    });

    return csv;
  }

  clear() {
    this.datasets.clear();
    this.renderCount = 0;
    this.metrics.clear();
    this.logger.info('Visualization cleared');

    return this;
  }

  // Utility methods
  getType() {
    return this.type;
  }

  getDatasetCount() {
    return this.datasets.size;
  }

  getDatasetNames() {
    return Array.from(this.datasets.keys());
  }

  getRenderCount() {
    return this.renderCount;
  }

  getCreatedAt() {
    return this.createdAt;
  }
}

module.exports = DataVisualization;
