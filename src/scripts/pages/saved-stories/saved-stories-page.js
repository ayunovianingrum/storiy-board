import * as StoryAPI from '../../data/api';
import SavedStoriesPresenter from './saved-stories-presenter';
import Database from '../../database';
import Map from '../../utils/map';
import { html } from '../../utils/html';
import { storyItem, popupContent, noData } from '../../template.js';

export default class SavedStoriesPage {
  #presenter;
  #map = null;
  #markers = [];

  async render() {
    const data = Array.from({ length: 3 });

    const itemLoading = `
      <div class="skeleton loading-stories relative min-h-110 rounded-[28px] p-6 transition">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
    `;

    return `
      <section class="m-auto w-full max-w-150 px-8 pt-37.5 text-center text-3xl font-medium md:text-4xl">
        <h1 class="leading-[1.6]">
          Stories you've <span class="cs-tag-text-outlined">saved</span> to
          <br />
          <span class="cs-tag-text">revisit</span> anytime.
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
      <div class="relative m-auto max-w-[80%] md:max-w-md">
        <input
          placeholder="Search by name, place, or desc of story.."
          type="search"
          id="search-saved-stories"
          name="search-saved-stories"
          autocomplete="off"
          class="cs-input border-light-bluish-grey mt-7! max-w-150 border pl-10!"
        />
        <i
          class="fas fa-search pointer-events-none absolute top-1/2 left-4 mt-0.5 h-5 w-5 -translate-y-1/2 text-gray-400 transition"
          aria-hidden="true"
        ></i>
      </div>
      <section
        id="story-container"
        class="mx-auto grid max-w-300 grid-cols-[repeat(auto-fit,minmax(250px,250px))] justify-center gap-6 pt-7 pb-7 md:pt-14"
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
    this.#presenter = new SavedStoriesPresenter({
      view: this,
      model: Database,
    });

    this.#presenter.init();
    this.#setupSearch();
    this.#setupPageAction();
  }

  destroy() {
    document
      .getElementById('story-container')
      .removeEventListener('click', this.#onClickDetail);

    document
      .getElementById('add-story-btn')
      .removeEventListener('click', this.#onClickAddNewStory);

    this.searchInput.removeEventListener('input', this.onSearchInput);
  }

  #setupPageAction() {
    document
      .getElementById('story-container')
      .addEventListener('click', this.#onClickDetail);

    document
      .getElementById('add-story-btn')
      .addEventListener('click', this.#onClickAddNewStory);
  }

  #setupSearch() {
    const debounce = (fn, delay = 300) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    };

    this.handleSearch = debounce(async (query) => {
      const results = await Database.searchStories(query);
      this.renderStories(results);
    }, 300);

    this.onInput = (e) => {
      this.handleSearch(e.target.value);
    };

    this.searchInput = document.getElementById('search-saved-stories');
    this.searchInput.addEventListener('input', this.onInput);
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

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 8,
      locate: true,
    });
  }

  #clearMarkers() {
    this.#markers.forEach((marker) => {
      marker.remove();
    });

    this.#markers = [];
  }

  renderStories(data) {
    this.#clearMarkers();
    const container = document.querySelector('#story-container');

    const renderStoryItem = () => {
      const storyItems = data.map((item) => {
        const marker = this.#map.addMarker(
          [item.lat, item.lon],
          { alt: item.name },
          {
            content: popupContent(item.name, item.description),
          },
          true,
        );

        this.#markers.push(marker);
        return storyItem(item);
      });

      container.innerHTML = storyItems.join('');
    };

    const render = () => {
      if (data.length === 0) {
        container.innerHTML = noData();
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
