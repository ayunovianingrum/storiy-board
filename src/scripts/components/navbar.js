import { html } from '../utils/html';
import { STORAGE_KEYS } from '../config';
import { capitalize } from '../utils';
import { getLogout } from '../utils/auth';

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.handleLogout = this.handleLogout.bind(this);
    this.closeMobileMenu = this.closeMobileMenu.bind(this);
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
  }

  connectedCallback() {
    this.init();

    window.addEventListener('hashchange', () => {
      this.activeMenu();
    });
  }

  attributeChangedCallback() {
    this.init();
  }

  disconnectedCallback() {
    this.teardown();
  }

  init() {
    this.teardown();
    this.render();
    this.populateUser();
    this.activeMenu();
    this.bindMobileNav();

    this.addEventListener('menu:logout', this.handleLogout);
  }

  teardown() {
    this.removeEventListener('menu:logout', this.handleLogout);
  }

  render() {
    this.innerHTML = html`
      <header id="nav-wrapper">
        <nav
          class="bg-light-bluish-grey/70 border-grey-10 fixed top-6 left-[50%] z-9999 w-max min-w-[90%] -translate-x-1/2 rounded-full border py-3 pr-4 pl-8 backdrop-blur-xl lg:min-w-[70%]"
        >
          <ul class="flex w-full items-center justify-between gap-2">
            <li>
              <a href="/#/" class="flex items-center gap-2">
                <img src="/logo-dark.png" class="h-5 w-5" alt="Storiy Logo" />
                <span class="font-semibold">Storiy Board</span>
              </a>
            </li>
            <li class="hidden md:block">
              <a href="/#/" data-nav="home">All Stories</a>
            </li>
            <li id="user-profile" class="hidden md:block"></li>
            <li class="md:hidden">
              <button
                id="mobile-nav-btn"
                aria-label="Open menu"
                aria-expanded="false"
                class="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/30"
              >
                <i class="fas fa-bars transition" aria-hidden="true"></i>
              </button>
            </li>
          </ul>
        </nav>

        <menu-item id="user-menu"></menu-item>
      </header>
    `;
  }

  activeMenu() {
    const hash = location.hash || '#/';
    const currentRoute = hash.replace('#/', '') || 'home';

    this.querySelectorAll('[data-nav]').forEach((el) => {
      const isActive = el.dataset.nav === currentRoute;

      el.classList.toggle('text-primary-60', isActive);
      el.classList.toggle('font-medium', isActive);

      el.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  populateUser() {
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    const name = userData?.USER_NAME || 'Your Name';

    this.buildDesktopProfile(name);
    this.buildMobileDropdown(name);
  }

  buildDesktopProfile(name) {
    const profile = this.querySelector('#user-profile');
    const menu = this.querySelector('#user-menu');
    if (!profile || !menu) return;

    profile.innerHTML = `
      <button
        id="desktop-profile-btn"
        class="flex cursor-pointer items-center gap-2 ml-4 rounded-full px-4 py-2 bg-white/50 transition hover:bg-white/70"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-controls="desktop-user-menu"
      >
        <i class="fas fa-user fa-sm" aria-hidden="true"></i>
        <span>${capitalize(name)}</span>
        <i id="chevron" class="fas fa-chevron-down ml-3 transition-transform duration-200" aria-hidden="true"></i>
      </button>
    `;

    const btn = profile.querySelector('#desktop-profile-btn');

    btn.addEventListener('click', (e) => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));
      btn.querySelector('#chevron').classList.toggle('rotate-180', !isExpanded);

      menu.open(e.currentTarget, {
        payload: { userId: 123 },
        items: [
          {
            label: 'Logout',
            action: 'logout',
            danger: true,
            icon: 'fas fa-sign-out-alt',
          },
        ],
      });
    });

    // Sync aria-expanded + chevron when menu closes from outside (Escape, click outside)
    menu.addEventListener('menu:close', () => {
      btn.setAttribute('aria-expanded', 'false');
      btn.querySelector('#chevron')?.classList.remove('rotate-180');
    });
  }

  buildMobileDropdown(name) {
    document.getElementById('mobile-dropdown')?.remove();
    document.getElementById('mobile-overlay')?.remove();

    const navWrapper = this.querySelector('#nav-wrapper');
    if (!navWrapper) return;

    const dropdown = document.createElement('div');
    dropdown.id = 'mobile-dropdown';
    dropdown.setAttribute('aria-hidden', 'true');
    dropdown.className = [
      'hidden',
      'md:!hidden',
      'bg-light-bluish-grey/70',
      'border-grey-10',
      'fixed top-23 left-[50%]',
      'z-[9999]',
      'w-max min-w-[90%] -translate-x-1/2',
      'rounded-2xl border p-4',
      'backdrop-blur-xl',
      'transition-all duration-200',
    ].join(' ');

    dropdown.innerHTML = `
      <div class="mb-3 flex items-center gap-3 rounded-full px-4 py-2 select-none">
        <i class="fas fa-user" aria-hidden="true"></i>
        <p class="font-medium">${capitalize(name)}</p>
      </div>
      <button
        id="mobile-logout-btn"
        class="flex w-full cursor-pointer items-center gap-2 rounded-full bg-white/30 px-4 py-2 text-red-500 transition hover:bg-red-50/40"
      >
        <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
        <p>Log out</p>
      </button>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'mobile-overlay';
    overlay.className = 'fixed inset-0 z-[9998] hidden';
    overlay.setAttribute('aria-hidden', 'true');

    navWrapper.appendChild(dropdown);
    navWrapper.appendChild(overlay);

    dropdown
      .querySelector('#mobile-logout-btn')
      .addEventListener('click', () => {
        this.closeMobileMenu();
        this.handleLogout();
      });

    overlay.addEventListener('click', this.closeMobileMenu);
  }

  bindMobileNav() {
    const btn = this.querySelector('#mobile-nav-btn');
    if (!btn) return;

    btn.addEventListener('click', this.toggleMobileMenu);

    this.escHandler = (e) => {
      if (e.key === 'Escape') this.closeMobileMenu();
    };
    document.addEventListener('keydown', this.escHandler);
  }

  toggleMobileMenu() {
    const dropdown = document.getElementById('mobile-dropdown');
    const overlay = document.getElementById('mobile-overlay');
    const btn = this.querySelector('#mobile-nav-btn');
    if (!dropdown || !overlay) return;

    const isOpen = !dropdown.classList.contains('hidden');

    if (isOpen) {
      this.closeMobileMenu();
    } else {
      dropdown.classList.remove('hidden');
      overlay.classList.remove('hidden');
      dropdown.setAttribute('aria-hidden', 'false');
      btn?.setAttribute('aria-expanded', 'true');
      btn?.querySelector('i')?.classList.replace('fa-bars', 'fa-times');
    }
  }

  closeMobileMenu() {
    const dropdown = document.getElementById('mobile-dropdown');
    const overlay = document.getElementById('mobile-overlay');
    const btn = this.querySelector('#mobile-nav-btn');

    dropdown?.classList.add('hidden');
    overlay?.classList.add('hidden');
    dropdown?.setAttribute('aria-hidden', 'true');
    btn?.setAttribute('aria-expanded', 'false');
    btn?.querySelector('i')?.classList.replace('fa-times', 'fa-bars');

    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }
  }

  handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      getLogout();
      location.hash = '/login';
    }
  }
}

customElements.define('navigation-bar', NavBar);
