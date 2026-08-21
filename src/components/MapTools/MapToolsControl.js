class MapToolsControl {
  onAdd() {
    this.container = document.createElement('div');
    this.container.className = 'map-tools';
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
