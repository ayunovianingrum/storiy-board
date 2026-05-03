import * as AuthModel from '../../utils/auth';
import * as StoryAPI from '../../data/api';
import AuthPresenter from './auth-presenter';
import { attachValidation } from '../../validation/validation';
import { loginForm, registerForm } from '../../template';

export default class AuthPage {
  #presenter = null;
  #content = null;
  #app = null;
  #mode = null;

  constructor(mode, app) {
    this.#mode = mode;
    this.#app = app;
    this.formHandlers = {};
    this.handleLoginClick = this.#handleLoginClick.bind(this);
    this.handleRegisterClick = this.#handleRegisterClick.bind(this);
  }

  render() {
    return `
      <section class="flex min-h-dvh w-full flex-col justify-center p-8">
        <div
          class="relative m-auto h-full w-full justify-between overflow-hidden rounded-4xl bg-primary-80 bg-cover bg-center p-5 md:flex md:h-150 md:p-4 lg:max-w-[70%] 2xl:h-200"
        >
          <div
            class="absolute inset-0 z-10 scale-105 bg-[url('/images/login-bg.jpg')] bg-cover bg-center"
          ></div>
          <aside
            class="relative z-20 flex w-full flex-col items-center gap-3 p-6 pb-10 md:h-full md:items-start md:justify-between md:p-6"
          >
            <header class="flex gap-2 md:order-1 md:flex-col">
              <img
                src="/images/icons/logo.png"
                class="w-7 md:w-12"
                alt="Storiy Logo"
              />
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
            class="bg-base-dark relative z-20 flex w-full flex-col justify-center rounded-3xl px-8 py-10 md:p-14"
          ></section>
          <snack-bar id="snackbar"></snack-bar>
        </div>
      </section>
    `;
  }

  afterRender() {
    this.#presenter = new AuthPresenter({
      view: this,
      model: StoryAPI,
      authModel: AuthModel,
    });

    this.#setupPage();
    this.#presenter.init(this.#mode);
    this.#setupAuthButtons();
  }

  destroy() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm && this.formHandlers.login) {
      loginForm.removeEventListener('submit', this.formHandlers.login);
    }

    if (registerForm && this.formHandlers.register) {
      registerForm.removeEventListener('submit', this.formHandlers.register);
    }

    this.loginButtons?.forEach((el) => {
      el.removeEventListener('click', this.handleLoginClick);
    });

    this.registerButtons?.forEach((el) => {
      el.removeEventListener('click', this.handleRegisterClick);
    });
  }

  #setupPage() {
    const content = this.#mode === 'login' ? loginForm() : registerForm();

    const container = document.getElementById('auth-panel');
    container.innerHTML = content;

    this.#updateActiveTab(this.#mode);
    this.#setupValidation(this.#mode);
  }

  #setupAuthButtons() {
    this.loginButtons = document.querySelectorAll('.login-btn');
    this.registerButtons = document.querySelectorAll('.register-btn');

    this.loginButtons.forEach((el) => {
      el.addEventListener('click', this.handleLoginClick);
    });

    this.registerButtons.forEach((el) => {
      el.addEventListener('click', this.handleRegisterClick);
    });
  }

  #handleLoginClick() {
    this.#app.switchTo('register');
  }

  #handleRegisterClick() {
    this.#app.switchTo('login');
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

  #updateActiveTab(mode) {
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.classList.remove('bg-white', 'text-black');
    });

    const activeTab = document.querySelector(`[href="#/${mode}"]`);

    if (activeTab) {
      activeTab.classList.add('bg-white', '!text-black');
    }
  }

  updateStateButton(state) {
    const button = document.getElementById('submit-btn');
    button.setButtonState(state);
  }

  #setupValidation(mode) {
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

    if (!form) return;

    if (this.formHandlers[mode]) {
      form.removeEventListener('submit', this.formHandlers[mode]);
    }

    this.formHandlers[mode] = handler;
    form.addEventListener('submit', handler);
  }
}
