import { sleep } from '../../utils';

export default class AuthPresenter {
  #view;
  #model;
  #authModel;
  #mode;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  init(mode) {
    this.handleView(mode);
    this.#view.bindSubmit(this.handleSubmitForm, mode);
  }

  async getLogin(payload) {
    this.#view.updateStateButton({ loading: true });

    try {
      const response = await this.#model.getLogin(payload);

      if (!response.ok) {
        console.error('getLogin: response:', response);
        this.#view.showSnackbar(`Error! ${response.message}`, 'error');
        return;
      }

      this.#authModel.putUserData({
        USER_NAME: response.loginResult.name,
        ACCESS_TOKEN_KEY: response.loginResult.token,
      });
      this.#view.showSnackbar('Login Successfully', 'success');
      await sleep(500);
      this.#view.loginSuccessfully();
    } catch (error) {
      console.error('getLogin: error:', error);
      this.#view.showSnackbar(`Error! ${error.message}`, 'error');
    } finally {
      this.#view.updateStateButton({ loading: false });
    }
  }

  async getRegister(payload) {
    this.#view.updateStateButton({ loading: true });
    try {
      const response = await this.#model.getRegistered(payload);

      if (!response.ok) {
        console.error('getRegister: response:', response);
        this.#view.showSnackbar(`Error! ${response.message}`, 'error');
        return;
      }

      this.#view.showSnackbar(response.message, 'success');

      await sleep(1500);
      this.#view.registerSuccessfully();
    } catch (error) {
      console.error('getRegister: error:', error);
      this.#view.showSnackbar(`Error! ${error.message}`, 'error');
    } finally {
      this.#view.updateStateButton({ loading: false });
    }
  }

  handleSubmitForm = async (event) => {
    event.preventDefault();

    const form = event.target;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = this.#view.getFormData(this.#mode);

    if (this.#mode === 'login') {
      await this.getLogin(data);
    } else {
      await this.getRegister(data);
    }
  };

  handleView(mode) {
    this.#mode = mode;
    const content =
      mode === 'login' ? this.#view.renderLogin() : this.#view.renderRegister();

    this.#view.updateContent(content);
    this.#view.updateActiveTab(mode);
    this.#view.setupValidation(mode);
  }
}
