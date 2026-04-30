import { html } from '../../utils/html';
import * as AuthModel from '../../utils/auth';
import * as StoryAPI from '../../data/api';
import AuthPresenter from './auth-presenter';
import { attachValidation } from '../../validation/validation';

export default class AuthPage {
  #presenter = null;
  #content = null;
  #app = null;
  #mode = null;

  constructor(mode, app) {
    this.#mode = mode;
    this.#app = app;
  }

  render() {
    return html`
      <section class="flex min-h-dvh w-full flex-col justify-center p-8">
        <div
          class="m-auto h-full w-full justify-between rounded-4xl bg-[url('/images/login-bg.jpg')] bg-cover bg-center p-5 md:flex md:h-150 md:p-4 lg:max-w-[70%] 2xl:h-200"
        >
          <aside
            class="flex w-full flex-col items-center gap-3 p-6 pb-10 md:h-full md:items-start md:justify-between md:p-6"
          >
            <header class="flex gap-2 md:order-1 md:flex-col">
              <img src="/logo.png" class="w-7 md:w-12" alt="Storiy Logo" />
              <span class="text-lg font-medium text-white">Storiy Board</span>
            </header>
            <nav
              class="flex w-max rounded-full border-2 border-white backdrop-blur-md md:order-0"
            >
              <a
                href="#/login"
                class="tab login-btn rounded-full px-4 py-2 text-white transition"
                >Login</a
              >
              <a
                href="#/register"
                class="tab register-btn rounded-full px-4 py-2 text-white transition"
                >Register</a
              >
            </nav>
          </aside>
          <section
            id="auth-panel"
            class="bg-base-dark flex w-full flex-col justify-center rounded-3xl px-8 py-10 md:p-14"
          ></section>
          <snack-bar id="snackbar"></snack-bar>
        </div>
      </section>
    `;
  }

  renderLogin() {
    return html`
      <section class="h-max" id="login-form-wrapper">
        <h1 class="mb-8 text-4xl font-medium">Login</h1>
        <form id="login-form">
          <div>
            <label for="email-login-input" class="cs-label">Email</label>
            <input
              id="email-login-input"
              class="cs-input"
              type="email"
              name="email"
              placeholder="Ex: story@gmail.com"
              required
              aria-describedby="email-error"
            />
            <p id="email-error" class="cs-err-message"></p>
          </div>
          <div>
            <label for="password-login-input" class="cs-label">
              Password
            </label>
            <input
              id="password-login-input"
              class="cs-input"
              type="password"
              name="password"
              placeholder="Type your password here.."
              required
              aria-describedby="password-error"
            />
            <p id="password-error" class="cs-err-message"></p>
          </div>
          <app-button
            id="submit-btn"
            type="submit"
            label="Login Now"
            custom-class="mt-10 w-full"
          ></app-button>
        </form>
        <p class="text-grey-90 mt-3 text-center text-xs">
          Don't have account yet?
          <strong>
            <a
              class="text-medium text-primary-60 register-btn cursor-pointer"
              href="#/register"
            >
              Register
            </a>
          </strong>
        </p>
      </section>
    `;
  }

  renderRegister() {
    return html`
      <section class="h-max" id="register-form-wrapper">
        <h1 class="mb-8 text-4xl font-medium">Register</h1>
        <form id="register-form">
          <div>
            <label for="fullname-input" class="cs-label">Full Name</label>
            <input
              id="fullname-input"
              class="cs-input"
              type="text"
              name="fullname"
              placeholder="Type your name here.."
              required
              aria-describedby="name-reg-error"
            />
            <p id="name-reg-error" class="cs-err-message"></p>
          </div>
          <div>
            <label for="email-register-input" class="cs-label">Email</label>
            <input
              id="email-register-input"
              class="cs-input"
              type="email"
              name="email"
              placeholder="Ex: story@gmail.com"
              required
              aria-describedby="email-reg-error"
            />
            <p id="email-reg-error" class="cs-err-message"></p>
          </div>
          <div>
            <label for="password-register-input" class="cs-label"
              >Password</label
            >
            <input
              id="password-register-input"
              class="cs-input"
              type="password"
              name="password"
              placeholder="Type your password here.."
              required
              aria-describedby="password-reg-error"
            />
            <p id="password-reg-error" class="cs-err-message"></p>
          </div>
          <app-button
            id="submit-btn"
            type="submit"
            label="Register Now"
            custom-class="mt-10 w-full"
          >
          </app-button>
        </form>
        <p class="text-grey-90 mt-3 text-center text-xs">
          Already have an account?
          <strong>
            <a
              class="text-medium text-primary-60 login-btn cursor-pointer"
              href="#/login"
              >Login</a
            >
          </strong>
        </p>
      </section>
    `;
  }

  afterRender() {
    this.#presenter = new AuthPresenter({
      view: this,
      model: StoryAPI,
      authModel: AuthModel,
    });

    this.#presenter.init(this.#mode);

    document.querySelectorAll('.login-btn').forEach((el) => {
      el.addEventListener('click', () => {
        this.#app.switchTo('login');
      });
    });

    document.querySelectorAll('.register-btn').forEach((el) => {
      el.addEventListener('click', () => {
        this.#app.switchTo('login');
      });
    });
  }

  loginSuccessfully() {
    location.hash = '/';
  }

  registerSuccessfully() {
    location.hash = '#/login';
  }

  showSnackbar(message, type) {
    document.getElementById('snackbar').show(message, type);
  }

  updateActiveTab(mode) {
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.classList.remove('bg-white', 'text-black');
    });

    const activeTab = document.querySelector(`[href="#/${mode}"]`);

    if (activeTab) {
      activeTab.classList.add('bg-white', '!text-black');
    }
  }

  updateContent(content) {
    const container = document.getElementById('auth-panel');
    container.innerHTML = content;
  }

  updateStateButton(state) {
    const button = document.getElementById('submit-btn');
    button.setButtonState(state);
  }

  setupValidation(mode) {
    if (mode === 'login') {
      attachValidation({
        emailInput: document.getElementById('email-login-input'),
        passwordInput: document.getElementById('password-login-input'),
      });
    } else {
      attachValidation({
        emailInput: document.getElementById('email-register-input'),
        passwordInput: document.getElementById('password-register-input'),
        nameInput: document.getElementById('fullname-input'),
      });
    }
  }

  getFormData(mode) {
    if (mode === 'login') {
      return {
        email: document.getElementById('email-login-input').value,
        password: document.getElementById('password-login-input').value,
      };
    }

    return {
      email: document.getElementById('email-register-input').value,
      password: document.getElementById('password-register-input').value,
      name: document.getElementById('fullname-input').value,
    };
  }

  bindSubmit(handler, mode) {
    const form =
      mode === 'login'
        ? document.getElementById('login-form')
        : document.getElementById('register-form');

    form?.addEventListener('submit', handler);
  }
}
