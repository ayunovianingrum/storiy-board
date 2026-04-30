import { sleep } from '../../utils';
import { attachValidation } from '../../validation/validation';
import { storyListMapper } from '../../data/api-mapper';

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  init() {
    this.initialStoriesAndMap();
  }

  async showMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialStoriesAndMap() {
    this.#view.showLoading();
    const payload = {
      location: 1,
      page: 1,
      size: 100,
    };
    try {
      await this.showMap();

      const response = await this.#model.getAllStories(payload);

      if (!response.ok) {
        console.error('initialStoriesAndMap: response:', response);
        this.#view.showSnackbar(`Error! ${response.message}`, 'error');
        return;
      }
      const story = response.listStory;
      this.#view.renderStories(response.listStory);

      const enrichedStories = await storyListMapper(story);
      this.#view.renderStories(enrichedStories);
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.showSnackbar(`Error! ${error.message}`, 'error');
    } finally {
      this.#view.hideLoading();
    }
  }
}
