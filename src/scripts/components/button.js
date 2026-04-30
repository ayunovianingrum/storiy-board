class AppButton extends HTMLElement {
  static get observedAttributes() {
    return [
      'variant',
      'disabled',
      'loading',
      'type',
      'label',
      'custom-class',
      'right-icon',
      'left-icon',
      'size',
    ];
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

  get type() {
    return this.getAttribute('type') || 'button';
  }

  get size() {
    return this.getAttribute('size') || 'md';
  }

  get customClass() {
    return this.getAttribute('custom-class') || '';
  }

  get variant() {
    return this.getAttribute('variant') || 'primary';
  }

  get isDisabled() {
    return this.hasAttribute('disabled');
  }

  get isLoading() {
    return this.hasAttribute('loading');
  }

  get label() {
    return this.getAttribute('label') || 'Button';
  }

  get button() {
    return this.querySelector('button');
  }

  get rightIcon() {
    return this.getAttribute('right-icon') || '';
  }

  get leftIcon() {
    return this.getAttribute('left-icon') || '';
  }

  setButtonState(state = {}) {
    const button = this.button;
    if (!button) return;

    const { loading = false, disabled = false, label = null } = state;

    const labelEl = button.querySelector('.btn-label');

    if (!labelEl.dataset.originalText) {
      labelEl.dataset.originalText = labelEl.textContent;
    }

    button.disabled = disabled || loading;

    if (loading) {
      button.classList.add('cs-btn-loading');
      labelEl.textContent = label ?? 'Loading...';
    } else {
      button.classList.remove('cs-btn-loading');
      labelEl.textContent = label || labelEl.dataset.originalText;
    }

    button.classList.toggle('is-disabled', disabled && !loading);
  }

  render() {
    const base = 'cs-btn';

    const variants = {
      primary: 'cs-btn-primary',
      secondary: 'cs-btn-secondary',
    };

    const disabledStyle = {
      primary: '!bg-grey-50 !cursor-not-allowed',
      secondary: '!border-grey-50 !cursor-not-allowed !text-grey-50',
    };

    const sizeStyle = {
      md: '',
      sm: 'text-sm! py-1! px-3!',
    };

    const loadingStyle = 'cs-btn-loading';

    const classes = [
      base,
      variants[this.variant],
      sizeStyle[this.size],
      this.isDisabled ? disabledStyle[this.variant] : '',
      this.isLoading ? loadingStyle : '',
      this.customClass,
    ].join(' ');

    this.innerHTML = `
      <button class="${classes}" ${this.isDisabled || this.isLoading ? 'disabled' : ''} type="${this.type}">
        <span class="btn-left-icon">${this.leftIcon ?? ''}</span>
        <span class="btn-label">${this.label}</span>
        <span class="btn-right-icon">${this.rightIcon ?? ''}</span>
      </button>
    `;
  }
}

customElements.define('app-button', AppButton);
