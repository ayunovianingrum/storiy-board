import * as StoryAPI from '../../data/api';
import {
  sleep,
  registerBackgroundSync,
  isReallyOnline,
  getUserName,
} from '../../utils';
import { SCROLL_INTENT } from '../../config';

export default class NewStoryPresenter {
  #view;
  #model;
  #dbModel;

  constructor({ view, model, dbModel }) {
    this.#view = view;
    this.#model = model;
    this.#dbModel = dbModel;
  }

  init() {
    this.showNewFormMap();
    this.#view.bindSubmit(this.handleSubmitForm);
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

  async keepPendingStory(payload) {
    await this.#dbModel.savePendingStory({
      ...payload,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      name: getUserName(),
    });
    await registerBackgroundSync();
    this.#view.showSnackbar(
      `You're offline. Your story is saved and will sync when you're back online.`,
      'warning',
    );
    await sleep(2500);
    window.__scrollIntent = SCROLL_INTENT.STORY;
    this.#view.redirectToHome('not-back');
  }

  async addNewStory(payload) {
    this.#view.updateStateButton({ loading: true });

    try {
      if (!(await isReallyOnline())) {
        await this.keepPendingStory(payload);
        return;
      }

      const response = await this.#model.addNewStory(payload);
      if (!response.ok) {
        if (response.status >= 500) {
          await this.keepPendingStory(payload);
        } else {
          this.#view.showSnackbar(`Error! ${response.message}`, 'error');
        }
        return;
      }

      this.#view.showSnackbar('Successfully Add New Story', 'success');
      await sleep(2000);
      window.__scrollIntent = SCROLL_INTENT.STORY;
      this.#view.redirectToHome('not-back');
    } catch (error) {
      await this.keepPendingStory(payload);
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
