class MapToolsControl {
  constructor(className = 'map-tools') {
    this.className = className;
  }

  onAdd() {
    this.container = document.createElement('div');
    this.container.className = this.className;
    return this.container;
  }

  onRemove() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = undefined;
  }
}

export default MapToolsControl;
