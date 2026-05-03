import * as StoryAPI from '../../data/api';
import HomePresenter from './home-presenter';
import Database from '../../database';
import Map from '../../utils/map';
import { storyItem, noData, popupContent } from '../../template.js';

export default class HomePage {
  #presenter;
  #map = null;

  constructor() {
    this.onStoriesSynced = this.onStoriesSynced.bind(this);
  }

  async render() {
    const data = Array.from({ length: 3 });

    const itemLoading = `
      <div class="skeleton loading-stories relative min-h-110 rounded-[28px] p-6 transition">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
    `;

    return `
      <section class="flex min-h-screen flex-col justify-end">
        <section
          class="m-auto w-full max-w-150 px-8 pt-37.5 text-center text-3xl font-medium md:text-4xl"
        >
          <h1 class="leading-[1.6]">
            Where all stories are being
            <span class="cs-tag-text-outlined">shared,</span>
            <span class="cs-tag-text-outlined">heard,</span> and
            <span class="cs-tag-text">connected.</span>
          </h1>
        </section>
        <section class="map-wrapper">
          <div id="map" class="transition"></div>
          <div class="map-fog-top z-999"></div>
          <div class="map-fog z-1000"></div>
          <div
            id="map-loading-container"
            class="skeleton absolute hidden h-full w-full rounded-2xl p-6 transition"
          >
            <div class="loader loader-absolute"></div>
          </div>
        </section>
      </section>
      <section
        id="story-container"
        class="mx-auto grid max-w-300 grid-cols-[repeat(auto-fit,minmax(250px,250px))] justify-center gap-6 pt-14 pb-7"
      >
        ${data.map(() => itemLoading).join('')}
      </section>
      <snack-bar id="snackbar" position="bottom"></snack-bar>
      <app-button
        custom-class="shadow-soft fixed left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-10 bottom-8 w-[185px] md:w-[220px] md:bottom-10 z-1001"
        id="add-story-btn"
        label="Share New Story"
        right-icon="<i class='fas fa-md fa-plus ml-2 text-white'></i>"
      ></app-button>`;
  }

  afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
      dbModel: Database,
    });

    this.#presenter.init();
    this.#setupPageAction();
  }

  destroy() {
    window.removeEventListener('stories:synced', this.onStoriesSynced);
    document
      .getElementById('story-container')
      .removeEventListener('click', this.#onClickDetail);

    document
      .getElementById('add-story-btn')
      .removeEventListener('click', this.#onClickAddNewStory);
  }

  #setupPageAction() {
    document
      .getElementById('story-container')
      .addEventListener('click', this.#onClickDetail);

    document
      .getElementById('add-story-btn')
      .addEventListener('click', this.#onClickAddNewStory);

    window.addEventListener('stories:synced', this.onStoriesSynced);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 8,
      locate: true,
    });
  }

  async onStoriesSynced() {
    await this.#presenter.syncStoriesList();
  }

  #onClickAddNewStory() {
    location.hash = '#/new-story';
  }

  #onClickDetail(e) {
    const button = e.target.closest('app-button');
    if (!button) return;

    const id = button.dataset.id;
    location.hash = `#/story/${id}`;
  }

  renderStories(data, error = '') {
    const storyContainer = document.getElementById('story-container');

    const renderStoryItem = () => {
      const storyItemData = data.reduce((accumulator, item) => {
        if (this.#map) {
          const coordinate = [item.lat, item.lon];
          const markerOptions = { alt: item.name };
          const popupOptions = {
            content: popupContent(item.name, item.description),
          };
          this.#map.addMarker(coordinate, markerOptions, popupOptions, true);
        }

        return accumulator.concat(storyItem(item));
      }, '');

      storyContainer.innerHTML = storyItemData;
    };

    const render = () => {
      if (data.length === 0) {
        storyContainer.innerHTML = noData({ desc: error });
        return;
      }
      renderStoryItem();
    };

    if (!document.startViewTransition) {
      render();
      return;
    }

    document.startViewTransition(() => {
      render();
    });
  }

  showMapLoading() {
    document.getElementById('map-loading-container').classList.remove('hidden');
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').classList.add('hidden');
  }

  showLoading() {
    document.querySelectorAll('.loading-stories').forEach((el) => {
      el.classList.remove('hidden');
    });
  }

  hideLoading() {
    document.querySelectorAll('.loading-stories').forEach((el) => {
      el.classList.add('hidden');
    });
  }

  showSnackbar(message, type) {
    document.getElementById('snackbar').show(message, type);
  }
}
