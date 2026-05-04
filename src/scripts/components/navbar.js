import { navbarDropdown } from '../template';
import { capitalize, getUserName } from '../utils';
import { getLogout } from '../utils/auth';

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.dropdown = null;
    this.overlay = null;
    this.logoutBtn = null;

    this.handleLogout = this.#handleLogout.bind(this);
    this.closeMenu = this.#closeMenu.bind(this);
    this.toggleMenu = this.#toggleMenu.bind(this);
    this.escHandler = this.#escHandler.bind(this);
    this.onClickLogout = this.#onClickLogout.bind(this);
  }

  connectedCallback() {
    this.init();
  }

  attributeChangedCallback() {
    this.init();
  }

  disconnectedCallback() {
    const btn = this.querySelector('#menu-btn');

    if (btn) {
      btn.removeEventListener('click', this.toggleMenu);
    }

    this.removeEventListener('menu:logout', this.handleLogout);
    window.removeEventListener('hashchange', this.#activeMenu);
    document.removeEventListener('keydown', this.escHandler);
  }

  init() {
    this.render();
    this.#populateUser();
    this.#activeMenu();
    this.#bindNav();

    this.addEventListener('hashchange', this.#activeMenu);
    this.addEventListener('menu:logout', this.handleLogout);
  }

  render() {
    this.innerHTML = `
      <header id="nav-wrapper">
        <nav class="bg-light-bluish-grey/80 border-grey-10 fixed top-6 left-1/2 z-9999 w-max min-w-[90%] -translate-x-1/2 rounded-full border py-3 pr-6 pl-8 backdrop-blur-xl lg:min-w-[70%]">
          <ul class="flex w-full items-center justify-between gap-2">
            <li>
              <a href="#/" class="flex items-center gap-2">
                <img
                  src="images/icons/logo-dark.png"
                  class="h-5 w-5"
                  alt="Storiy Logo"
                />
                <span class="font-semibold">Storiy Board</span>
              </a>
            </li>
            <ul class="flex gap-6">
              <li class="hidden md:block">
                <a href="#/" data-nav="home">All Stories</a>
              </li>
              <li class="hidden md:block">
                <a href="#/saved-stories" data-nav="saved-stories">
                  Saved Stories
                </a>
              </li>
            </ul>
            <li class="flex justify-end md:min-w-32">
              <button
                id="menu-btn"
                aria-label="Open menu"
                aria-expanded="false"
                class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-white/30"
              >
                <i class="fas fa-ellipsis-h transition" aria-hidden="true"></i>
              </button>
            </li>
          </ul>
        </nav>
      </header>
    `;
  }

  #activeMenu() {
    const hash = location.hash || '#/';
    const currentRoute = hash.replace('#/', '') || 'home';

    this.querySelectorAll('[data-nav]').forEach((el) => {
      const isActive = el.dataset.nav === currentRoute;

      el.classList.toggle('text-primary-60', isActive);
      el.classList.toggle('font-medium', isActive);

      el.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  #populateUser() {
    const name = getUserName();
    this.#buildDropdown(name);
  }

  #buildDropdown(name) {
    this.#destroyDropdown();

    const navWrapper = this.querySelector('#nav-wrapper');
    if (!navWrapper) return;

    const dropdown = document.createElement('div');
    dropdown.innerHTML = navbarDropdown(name);

    const overlay = document.createElement('div');
    overlay.id = 'dropdown-overlay';
    overlay.className = 'fixed inset-0 z-[9998] hidden';

    navWrapper.appendChild(dropdown);
    navWrapper.appendChild(overlay);

    const logoutBtn = dropdown.querySelector('#logout-btn');

    logoutBtn?.addEventListener('click', this.onClickLogout);
    overlay.addEventListener('click', this.closeMenu);

    this.dropdown = dropdown;
    this.overlay = overlay;
    this.logoutBtn = logoutBtn;
  }

  #destroyDropdown() {
    this.logoutBtn?.removeEventListener('click', this.onClickLogout);
    this.overlay?.removeEventListener('click', this.closeMenu);

    this.dropdown?.remove();
    this.overlay?.remove();

    this.dropdown = null;
    this.overlay = null;
    this.logoutBtn = null;
  }

  #onClickLogout() {
    this.closeMenu();
    this.handleLogout();
  }

  #bindNav() {
    const btn = this.querySelector('#menu-btn');
    if (!btn) return;

    btn.addEventListener('click', this.toggleMenu);
    document.addEventListener('keydown', this.escHandler);
  }

  #escHandler = (e) => {
    if (e.key === 'Escape') this.closeMenu();
  };

  #toggleMenu() {
    const dropdown = document.getElementById('dropdown');
    const overlay = document.getElementById('dropdown-overlay');
    if (!dropdown || !overlay) return;

    const isOpen = !dropdown.classList.contains('hidden');

    if (isOpen) {
      this.closeMenu();
    } else {
      this.#openMenu();
    }
  }

  #openMenu() {
    const dropdown = document.getElementById('dropdown');
    const overlay = document.getElementById('dropdown-overlay');
    const btn = this.querySelector('#menu-btn');

    dropdown?.classList.remove('hidden');
    overlay?.classList.remove('hidden');
    btn?.setAttribute('aria-expanded', 'true');
    btn?.querySelector('#chevron')?.classList.add('rotate-180');
  }

  #closeMenu() {
    const dropdown = document.getElementById('dropdown');
    const overlay = document.getElementById('dropdown-overlay');
    const btn = this.querySelector('#menu-btn');

    dropdown?.classList.add('hidden');
    overlay?.classList.add('hidden');
    dropdown?.setAttribute('aria-hidden', 'true');
    btn?.setAttribute('aria-expanded', 'false');
    btn?.querySelector('#chevron')?.classList.remove('rotate-180');

    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }
  }

  #handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      getLogout();
      location.hash = '/login';
    }
  }
}

customElements.define('navigation-bar', NavBar);
