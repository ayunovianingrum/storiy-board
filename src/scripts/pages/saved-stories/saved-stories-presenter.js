export default class SavedStoriesPresenter {
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
      this.#view.showSnackbar(`Error! ${error}`, 'error');
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialStoriesAndMap() {
    this.#view.showLoading();

    try {
      await this.showMap();

      const listStories = await this.#model.getAllStories();
      this.#view.renderStories(listStories);
    } catch (error) {
      this.#view.showSnackbar(`Error! ${error.message}`, 'error');
    } finally {
      this.#view.hideLoading();
    }
  }
}
