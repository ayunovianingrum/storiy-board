import { sleep } from '../utils';

class SnackBar extends HTMLElement {
  static get observedAttributes() {
    return ['position'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get position() {
    return this.getAttribute('position') || 'top';
  }

  render() {
    this.innerHTML = `<div id="snackbar" class="fixed left-1/2 -translate-x-1/2 transition hidden text-white z-9999"></div>`;

    this.el = this.querySelector('#snackbar');
  }

  show(message, type = 'success') {
    const baseStyle = `fixed left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg transition z-9999`;

    const position = {
      top: 'top-6',
      bottom: 'bottom-8',
    };

    const variants = {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-amber-500 text-white',
    };

    this.el.className = `${baseStyle} ${position[this.position]} ${variants[type] || variants.success}`;
    this.el.textContent = message;
    this.el.classList.remove('hidden');

    sleep(4000).then(() => {
      this.el.classList.add('hidden');
    });
  }
}

customElements.define('snack-bar', SnackBar);
