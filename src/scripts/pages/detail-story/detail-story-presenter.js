import { sleep } from '../../utils';
import { attachValidation } from '../../validation/validation';
import { storyDetailMapper, storyListMapper } from '../../data/api-mapper';

export default class DetailStoryPresenter {
  #view;
  #model;
  #storyId;

  constructor(storyId, { view, model }) {
    this.#view = view;
    this.#model = model;
    this.#storyId = storyId;
  }

  init() {
    this.initialStoriesAndMap();
  }

  async showMap() {
    this.#view.showMapLoading();

    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialStoriesAndMap() {
    this.#view.showLoading();
    await this.showMap();

    try {
      const response = await this.#model.getDetailStory(this.#storyId);

      if (!response.ok) {
        console.error('initialStoriesAndMap: response:', response);
        this.#view.showSnackbar(`Error! ${response.message}`, 'error');
        return;
      }

      const populateData = await storyDetailMapper(response.story);
      this.#view.populateStoryData(populateData);
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.showSnackbar(`Error! ${error.message}`, 'error');
    } finally {
      this.#view.hideLoading();
    }
  }
}
