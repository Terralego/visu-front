/* eslint-disable no-underscore-dangle */
class DeclarationControl {
  constructor(toggleFn) {
    this.toggleDeclarationModule = toggleFn;
    this.isActive = false;
  }

  onAdd() {
    this._map = undefined;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-declaration';

    this._button = document.createElement('button');
    this._button.className = 'mapboxgl-ctrl-icon';
    this._button.type = 'button';
    this._button.title = 'Declaration';

    this._button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="18" height="18" viewBox="0 0 24 24"><path d="M16.971 0h-9.942l-7.029 7.029v9.941l7.029 7.03h9.941l7.03-7.029v-9.942l-7.029-7.029zm-5.971 5h2v10h-2v-10zm1 14.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/></svg>
    `;

    this._button.addEventListener('click', () => {
      this.toggleDeclarationModule();
    });

    this._container.appendChild(this._button);
    this.updateButtonState();
    return this._container;
  }

  updateState(isActive) {
    this.isActive = isActive;
    this.updateButtonState();
  }

  updateButtonState() {
    if (this._button) {
      if (this.isActive) {
        this._button.style.color = 'white';
        this._button.style.opacity = '1';
      } else {
        this._button.style.color = '';
        this._button.style.opacity = '0.8';
      }
    }
  }

  onRemove() {
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    this._map = undefined;
  }
}

export default DeclarationControl;
