import { storyDetailMapper } from '../../data/api-mapper';

export default class DetailStoryPresenter {
  #view;
  #model;
  #storyId;
  #dbModel;

  constructor(storyId, { view, model, dbModel }) {
    this.#view = view;
    this.#model = model;
    this.#storyId = storyId;
    this.#dbModel = dbModel;
  }

  init() {
    this.initialStoriesAndMap();
    this.pickSaveButton();
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
        this.#view.populateStoryData(null, response.message);
        this.#view.showSnackbar(`Error! ${response.message}`, 'error');
        return;
      }

      const populateData = await storyDetailMapper(response.story);
      this.#view.populateStoryData(populateData);
    } catch (error) {
      this.#view.populateStoryData(null, error.message);
      this.#view.showSnackbar(`Error! ${error.message}`, 'error');
    } finally {
      this.#view.hideLoading();
    }
  }

  async pickSaveButton() {
    const isSaved = await this.#isStorySaved();
    const taskToDo = isSaved ? 'remove' : 'save';

    this.#view.renderSaveButton(taskToDo);
  }

  async #isStorySaved() {
    return !!(await this.#dbModel.getStoryById(this.#storyId));
  }

  async saveStory() {
    try {
      await this.#dbModel.putStory(this.#view.storyData);
      this.#view.showSnackbar(
        'Successfully saved story to bookmark',
        'success',
      );
    } catch (error) {
      console.error('saveReport: error:', error);
      this.#view.showSnackbar(`Error! ${error.message}`, 'error');
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStory(this.#storyId);
      this.#view.showSnackbar(
        'Successfully removed story from bookmark',
        'success',
      );
    } catch (error) {
      console.error('removeStory: error:', error);
      this.#view.showSnackbar(`Error! ${error.message}`, 'error');
    }
  }
}
