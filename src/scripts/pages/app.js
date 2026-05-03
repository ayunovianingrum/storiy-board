import routes from '../routes/routes';
import AuthLayout from './layout/auth-layout';
import MainLayout from './layout/layout';
import { SCROLL_INTENT } from '../config';
import { scrollToStoryList, transitionHelper } from '../utils';
import { parseActivePathname, resolveFinalRoute } from '../routes/url-parser';

class App {
  #content = null;
  currentPage = null;

  constructor({ content }) {
    this.#content = content;
  }

  async renderPage() {
    const finalRoute = await resolveFinalRoute();
    const routeHandler = routes[finalRoute];

    if (!routeHandler) {
      return;
    }

    const newPage = routeHandler(this);
    if (!newPage) {
      return;
    }

    if (this.currentPage?.destroy) {
      try {
        this.currentPage.destroy();
      } catch (err) {
        console.error('Error while destroying previous page:', err);
      }
    }

    this.currentPage = newPage;

    const { resource } = parseActivePathname();
    const isAuth = resource === 'login' || resource === 'register';

    const layoutInstance = isAuth ? new AuthLayout() : new MainLayout();
    const layout = await layoutInstance.render();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = layout;

        const main = document.querySelector('#main-content');
        if (main) {
          main.innerHTML = await newPage.render();
          newPage.afterRender?.();
        }

        layoutInstance.afterRender?.();
        this.initSkipLink();
      },
    });

    transition.ready.catch(() => {});

    transition.finished
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .then(() => {
        const intent = window.__scrollIntent ?? SCROLL_INTENT.TOP;

        requestAnimationFrame(() => {
          if (intent === SCROLL_INTENT.TOP) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }

          if (intent === SCROLL_INTENT.STORY) {
            scrollToStoryList();
          }
          window.__scrollIntent = null;
        });
      });
  }

  initSkipLink() {
    const btn = document.getElementById('skip-link');
    const main = document.getElementById('main-content');

    if (!btn || !main) return;

    btn.onclick = () => {
      const target = main.querySelector('h1, h2, [tabindex="-1"]') || main;

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
  }

  switchTo(mode, { skipTransition = false } = {}) {
    const transition = transitionHelper({
      skipTransition,
      updateDOM: () => this.applySwitch(mode),
    });

    transition.finished?.catch(() => {});
  }

  applySwitch(mode) {
    const card = document.querySelector('.auth-card');
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');

    if (!card || !loginForm || !registerForm) return;

    if (mode === 'register') {
      card.classList.add('register-mode');
      loginForm.hidden = true;
      registerForm.hidden = false;
    } else {
      card.classList.remove('register-mode');
      registerForm.hidden = true;
      loginForm.hidden = false;
    }
  }
}

export default App;
