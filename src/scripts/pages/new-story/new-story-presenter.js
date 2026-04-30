import * as StoryAPI from '../../data/api';
import { sleep } from '../../utils';
import { SCROLL_INTENT } from '../../config';

export default class NewStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  init() {
    this.showNewFormMap();
    this.#view.bindSubmit(this.handleSubmitForm);
    this.#view.initLiveValidation();
  }

  async showNewFormMap() {
    this.#view.showMapLoading();

    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async addNewStory(payload) {
    this.#view.updateStateButton({ loading: true });

    try {
      const response = await this.#model.addNewStory(payload);

      if (!response.ok) {
        this.#view.showSnackbar(`Error! ${response.message}`, 'error');
        return;
      }

      this.#view.showSnackbar('Successfully Add New Story', 'success');

      window.__scrollIntent = SCROLL_INTENT.STORY;
      this.#view.redirectToHome();
    } catch (error) {
      console.error('addNewStory: error:', error);
      this.#view.showSnackbar(`Error! ${error.message}`, 'error');
    } finally {
      this.#view.updateStateButton({ loading: false });
    }
  }

  handleSubmitForm = async (data) => {
    const errors = this.#view.validate(data);

    if (errors.length > 0) {
      this.#view.showErrors(errors);
      return;
    }

    await this.addNewStory(data);
  };
}
