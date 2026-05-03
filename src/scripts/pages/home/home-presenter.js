import { storyListMapper } from '../../data/api-mapper';

export default class HomePresenter {
  #view;
  #model;
  #isMapInitialized = false;
  #dbModel;

  constructor({ view, model, dbModel }) {
    this.#view = view;
    this.#model = model;
    this.#dbModel = dbModel;
  }

  init() {
    this.initialStoriesAndMap();
  }

  async showMap() {
    if (this.#isMapInitialized) return;

    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
      this.#isMapInitialized = true;
    } catch (error) {
      console.error('showMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async fetchStories() {
    this.#view.showLoading();
    const payload = { location: 1, page: 1, size: 100 };

    try {
      const response = await this.#model.getAllStories(payload);

      if (!response.ok) {
        this.#view.renderStories([], response.message);
        this.#view.showSnackbar(`Error! ${response.message}`, 'error');
        return;
      }

      const enrichedStories = await storyListMapper(response.listStory).catch(
        () => response.listStory,
      );

      await this.mergeStoriesData(enrichedStories);
      return response;
    } catch (error) {
      this.#view.renderStories([], error.message);
      this.#view.showSnackbar(`Error! ${error.message}`, 'error');
    } finally {
      this.#view.hideLoading();
    }
  }

  async syncStoriesList() {
    try {
      const response = await this.fetchStories();

      if (!response || !response.ok) {
        this.#view.showSnackbar(
          `Error to sync list stories. Try to refresh the page`,
          'error',
        );
        return;
      }

      this.#view.showSnackbar(
        `Sync successful. List stories are now up to date`,
        'success',
      );
    } catch (error) {
      console.error('syncStoriesList error:', error);
      this.#view.showSnackbar(
        `Error to sync list stories. Try to refresh the page`,
        'error',
      );
    }
  }

  async initialStoriesAndMap() {
    await this.showMap();
    await this.fetchStories();
  }

  async mergeStoriesData(updatedStories) {
    const pendingStories = await this.#dbModel.getPendingStories();
    const merged = [...pendingStories, ...updatedStories];

    this.#view.renderStories(merged);
  }
}
