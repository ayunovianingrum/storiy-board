import routes from '../routes/routes';
import { parseActivePathname, getActiveRoute } from '../routes/url-parser';
import { transitionHelper } from '../utils';
import { SCROLL_INTENT } from '../config';
import AuthLayout from './layout/auth-layout';
import MainLayout from './layout/layout';

class App {
  #content = null;

  constructor({ content }) {
    this.#content = content;
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];
    const page = route(this);

    const { resource } = parseActivePathname();
    const isAuth = resource === 'login' || resource === 'register';

    const layoutInstance = isAuth ? new AuthLayout() : new MainLayout();

    const layout = await layoutInstance.render();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = layout;

        const main = document.querySelector('#main-content');
        if (main) {
          main.innerHTML = await page?.render();
          page?.afterRender?.();
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
            const el = document.querySelector('#story-container');

            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY;

              window.scrollTo({
                top: top - 80,
                behavior: 'smooth',
              });
            }
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
