import { html } from '../utils/html';
class MenuItem extends HTMLElement {
  constructor() {
    super();
    this._isOpen = false;
    this._anchor = null;

    this._handleKeydown = this._handleKeydown.bind(this);
    this._handleClickOutside = this._handleClickOutside.bind(this);
    this._handleActionClick = this._handleActionClick.bind(this);
  }

  connectedCallback() {
    this.render();

    this._panel = this.querySelector('.menu-panel');
    this._backdrop = this.querySelector('.menu-backdrop');

    this._panel.addEventListener('click', this._handleActionClick);
    this._backdrop.addEventListener('click', () => this.close());
  }

  render() {
    this.innerHTML = html`
      <div class="menu-backdrop fixed inset-0 bg-black/10" hidden></div>
      <div
        class="menu-panel border-grey-10 fixed z-9999 min-w-40 rounded-full border bg-white/70 p-2 shadow-lg backdrop-blur-xl"
        role="menu"
        aria-label="User menu"
        hidden
      ></div>
    `;
  }

  open(anchorEl, { items = [], payload = {} }) {
    if (this._isOpen) return this.close();

    document.querySelectorAll('menu-item').forEach((m) => {
      if (m !== this) m.close();
    });

    this._payload = payload;
    this._anchor = anchorEl;
    this._panel.innerHTML = this._renderItems(items);
    this._panel.hidden = false;
    this._isOpen = true;

    setTimeout(() => {
      document.addEventListener('keydown', this._handleKeydown);
      document.addEventListener('click', this._handleClickOutside);
    }, 0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._position(anchorEl);
        this._panel.querySelector('.menu-action')?.focus();
      });
    });
  }

  close() {
    if (!this._isOpen) return;

    this._panel.hidden = true;
    this._backdrop.hidden = true;
    this._isOpen = false;

    this._anchor?.focus();
    this._anchor = null;

    document.removeEventListener('keydown', this._handleKeydown);
    document.removeEventListener('click', this._handleClickOutside);

    this.dispatchEvent(new CustomEvent('menu:close', { bubbles: true }));
  }

  _renderItems(items) {
    return items
      .map(
        (item) => html`
          <button
            class="menu-action ${item.danger
              ? 'text-red-500'
              : ''} flex w-full cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            role="menuitem"
            data-action="${item.action}"
          >
            ${item.icon
              ? `<i class="${item.icon}" aria-hidden="true"></i>`
              : ''}
            <span>${item.label}</span>
          </button>
        `,
      )
      .join('');
  }

  _position(anchorEl) {
    const rect = anchorEl.getBoundingClientRect();

    const panelWidth = this._panel.offsetWidth;
    const panelHeight = this._panel.offsetHeight;

    let top = rect.bottom + 8;
    let left = rect.left;

    if (left + panelWidth > window.innerWidth) {
      left = window.innerWidth - panelWidth - 8;
    }

    if (top + panelHeight > window.innerHeight) {
      top = rect.top - panelHeight - 8;
    }

    this._panel.style.top = `${top}px`;
    this._panel.style.left = `${left}px`;
  }

  _handleKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }

    const items = [...this._panel.querySelectorAll('.menu-action')];
    const index = items.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(index + 1) % items.length]?.focus();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }

    if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    }

    if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  }

  _handleClickOutside(e) {
    if (this._anchor?.contains(e.target)) return;
    if (!this.contains(e.target)) this.close();
  }

  _handleActionClick(e) {
    const btn = e.target.closest('.menu-action');
    if (!btn) return;

    const action = btn.dataset.action;

    this.dispatchEvent(
      new CustomEvent(`menu:${action}`, {
        detail: this._payload,
        bubbles: true,
      }),
    );

    this.close();
  }
}

customElements.define('menu-item', MenuItem);
