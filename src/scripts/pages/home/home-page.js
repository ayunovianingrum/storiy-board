import { html } from '../../utils/html';
import * as StoryAPI from '../../data/api';
import HomePresenter from './home-presenter';
import { capitalize } from '../../utils';
import Map from '../../utils/map';
import MainLayout from '../layout/layout';
import StoryItem from '../../components/story-item';

export default class HomePage {
  #presenter;
  #map = null;

  async render() {
    const data = Array.from({ length: 3 });

    const itemLoading = `
      <div class="skeleton loading-stories relative min-h-110 rounded-[28px] p-6 transition">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
    `;

    return html`<section
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
    });

    this.#presenter.init();
    const storyContainer = document.getElementById('story-container');

    storyContainer.addEventListener('click', (e) => {
      const button = e.target.closest('app-button');
      if (!button) return;

      const id = button.dataset.id;
      location.hash = `#/story/${id}`;
    });

    document.getElementById('add-story-btn').addEventListener('click', () => {
      location.hash = '#/new-story';
    });
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 8,
      locate: true,
    });
  }

  renderStories(data) {
    const storyItem = data.reduce((accumulator, item) => {
      if (this.#map) {
        const coordinate = [item.lat, item.lon];
        const markerOptions = { alt: item.name };
        const popupOptions = {
          content: this.popupContent(item.name, item.description),
        };
        this.#map.addMarker(coordinate, markerOptions, popupOptions, true);
      }

      return accumulator.concat(StoryItem(item));
    }, '');

    const storyContainer = document.getElementById('story-container');
    storyContainer.innerHTML = storyItem;
  }

  popupContent(name, description) {
    return html`<p class="font-medium">${name}</p>
      <p class="line-clamp-5">${description}</p>`;
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
