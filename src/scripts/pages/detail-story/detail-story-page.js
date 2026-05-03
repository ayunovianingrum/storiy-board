import * as StoryAPI from '../../data/api';
import DetailStoryPresenter from './detail-story-presenter';
import { capitalize } from '../../utils';
import Map from '../../utils/map';
import MainLayout from '../layout/layout';
import { parseActivePathname } from '../../routes/url-parser';
import { showFormattedDate } from '../../utils';
import Database from '../../database';
import {
  bookmarkStoryButton,
  descriptionDetailStory,
  imageDetailStory,
  metaDataDetailStory,
  noData,
} from '../../template';

export default class DetailStoryPage {
  #presenter;
  #storyData;
  #map = null;

  async render() {
    return `
      <section id="content" class="pt-28 pb-7 md:pt-32">
        <section class="m-auto w-270 max-w-[85%] lg:max-w-[70%]">
          <app-button
            custom-class="mb-6 md:mb-8"
            id="back-btn"
            label="Back"
            left-icon="<i class='fas fa-sm fa-chevron-down rotate-90 mr-2'></i>"
            variant="secondary"
            size="sm"
          ></app-button>
          <div
            id="detail-container"
            class="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-6"
          >
            <section id="meta-data-story" class="md:col-span-2">
              <div class="loading-container hidden w-full">
                <div class="skeleton-title md:w-[20%]!"></div>
              </div>
            </section>
            <section
              id="story-image"
              class="relative m-auto aspect-square w-full overflow-hidden rounded-3xl md:col-span-2 md:aspect-2/1"
            >
              <div class="loading-container skeleton absolute hidden h-full w-full rounded-2xl p-6 transition"></div>
            </section>
            <section id="detail-story">
              <div class="loading-container mt-2 hidden h-full w-full transition">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
              </div>
            </section>
            <section class="relative mt-2 h-60 rounded-2xl md:h-80" aria-label="Story location map">
              <div id="map" class="h-full rounded-2xl"></div>
              <div id="map-loading-container" class="skeleton absolute hidden h-full w-full rounded-2xl p-6 transition">
                <div class="loader loader-absolute"></div>
              </div>
            </section>
            <section id="save-action-wrapper" class="md:col-span-2"></section>
          </div>
        </section>
        <snack-bar id="snackbar" position="bottom"></snack-bar>
      </section>`;
  }

  afterRender() {
    this.#presenter = new DetailStoryPresenter(parseActivePathname().id, {
      view: this,
      model: StoryAPI,
      dbModel: Database,
    });

    this.#presenter.init();
    this.#setupPage();
    this.#setupSaveButton();
  }

  destroy() {
    document
      .getElementById('save-action-wrapper')
      .removeEventListener('click', this.onClickSave);

    document
      .getElementById('back-btn')
      .removeEventListener('click', this.#onClickBack);
  }

  set storyData(data) {
    this.#storyData = data;
  }

  get storyData() {
    return this.#storyData;
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: false,
    });
  }

  #setupPage() {
    document
      .getElementById('back-btn')
      .addEventListener('click', this.#onClickBack);
  }

  #onClickBack() {
    history.back();
  }

  #renderMetaDataStory(data) {
    document.getElementById('meta-data-story').innerHTML =
      metaDataDetailStory(data);
  }

  #renderStory(data) {
    document.getElementById('detail-story').innerHTML = descriptionDetailStory(
      data?.description,
    );
  }

  #renderImage(data) {
    document.getElementById('story-image').innerHTML = imageDetailStory(data);
  }

  #setupSaveButton() {
    this.onClickSave = async (e) => {
      const button = e.target.closest('#save-story-btn');
      if (!button) return;

      const task = button.dataset.task;

      if (task === 'save') {
        await this.#presenter.saveStory();
      } else {
        await this.#presenter.removeStory();
      }

      this.#presenter.pickSaveButton();
    };

    document
      .getElementById('save-action-wrapper')
      .addEventListener('click', this.onClickSave);
  }

  renderSaveButton(task) {
    const wrapper = document.getElementById('save-action-wrapper');
    wrapper.innerHTML = bookmarkStoryButton(task);
  }

  populateStoryData(data, error = '') {
    this.storyData = data;

    if (!data?.name) {
      document.getElementById('detail-container').innerHTML = noData({
        desc: error,
      });
      return;
    }

    this.#renderStory(data);
    this.#renderMetaDataStory(data);
    this.#renderImage(data);

    if (this.#map) {
      const storyCoordinate = [data.lat, data.lon];
      const markerOptions = { alt: data.placeName };
      const popupOptions = {
        content: data.placeName,
      };
      this.#map.changeCamera(storyCoordinate);
      this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
    }
  }

  showMapLoading() {
    document.getElementById('map-loading-container').classList.remove('hidden');
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').classList.add('hidden');
  }

  showSnackbar(message, type) {
    document.getElementById('snackbar').show(message, type);
  }

  showLoading() {
    document.querySelectorAll('.loading-container').forEach((el) => {
      el.classList.remove('hidden');
    });
  }

  hideLoading() {
    document.querySelectorAll('.loading-container').forEach((el) => {
      el.classList.add('hidden');
    });
  }
}
