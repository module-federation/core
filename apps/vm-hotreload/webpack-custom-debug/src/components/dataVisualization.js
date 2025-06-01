class DataVisualization {
  constructor(id = 'chart') {
    this.id = id;
    this.type = 'line';
    this.datasets = new Map();
    this.renderCount = 0;
    this.createdAt = new Date().toISOString();
  }

  setType(type) {
    const validTypes = ['line', 'bar', 'pie', 'scatter', 'area'];
    if (validTypes.includes(type)) {
      this.type = type;
    }
  }

  getType() {
    return this.type;
  }

  addDataset(name, data, options = {}) {
    const dataset = {
      name,
      data: [...data],
      options: {
        color: options.color || '#007bff',
        label: options.label || name,
        type: options.type || this.type,
        ...options,
      },
      createdAt: new Date().toISOString(),
    };

    this.datasets.set(name, dataset);
    return dataset;
  }

  updateDataset(name, newData) {
    if (this.datasets.has(name)) {
      const dataset = this.datasets.get(name);
      dataset.data = [...newData];
      dataset.updatedAt = new Date().toISOString();
    }
  }

  getDatasetCount() {
    return this.datasets.size;
  }

  getRenderCount() {
    return this.renderCount;
  }

  render() {
    this.renderCount++;
    return {
      id: this.id,
      type: this.type,
      datasets: Object.fromEntries(this.datasets),
      renderCount: this.renderCount,
      renderedAt: new Date().toISOString(),
    };
  }
}

module.exports = DataVisualization;
