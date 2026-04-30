import { html } from '../../utils/html';
import * as StoryAPI from '../../data/api';
import DetailStoryPresenter from './detail-story-presenter';
import { capitalize } from '../../utils';
import Map from '../../utils/map';
import MainLayout from '../layout/layout';
import StoryItem from '../../components/story-item';
import { parseActivePathname } from '../../routes/url-parser';
import { showFormattedDate } from '../../utils';

export default class DetailStoryPage {
  #presenter;
  #map = null;

  async render() {
    return html`<section id="content" class="pt-28 pb-7 md:pt-32">
      <section class="m-auto w-270 max-w-[85%] lg:max-w-[70%]">
        <app-button
          custom-class="mb-6 md:mb-8"
          id="back-btn"
          label="Back"
          left-icon="<i class='fas fa-sm fa-chevron-down rotate-90 mr-2'></i>"
          variant="secondary"
          size="sm"
        ></app-button>
        <div class="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-12">
          <section
            id="story-image"
            class="relative m-auto aspect-square w-full overflow-hidden rounded-3xl md:col-span-2 md:aspect-2/1"
          >
            <div
              class="loading-container skeleton absolute hidden h-full w-full rounded-2xl p-6 transition"
            ></div>
          </section>
          <section id="detail-story">
            <div
              class="loading-container skeleton hidden h-full w-full rounded-2xl p-6 transition"
            >
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
            </div>
          </section>
          <section
            class="relative h-60 rounded-2xl md:h-80"
            aria-label="Story location map"
          >
            <div id="map" class="h-full rounded-2xl"></div>
            <div
              id="map-loading-container"
              class="skeleton absolute hidden h-full w-full rounded-2xl p-6 transition"
            >
              <div class="loader loader-absolute"></div>
            </div>
          </section>
        </div>
      </section>
      <snack-bar id="snackbar"></snack-bar>
    </section>`;
  }

  afterRender() {
    this.#presenter = new DetailStoryPresenter(parseActivePathname().id, {
      view: this,
      model: StoryAPI,
    });

    this.#presenter.init();

    document.getElementById('back-btn').addEventListener('click', () => {
      location.hash = '/';
    });
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: false,
    });
  }

  renderStory(data) {
    document.getElementById('detail-story').innerHTML = html` <div
        class="mb-2 flex items-center gap-2 md:gap-3"
      >
        <i
          class="fas fa-user md:fa-lg bg-grey-70/10 rounded-full p-3 md:p-4"
        ></i>
        <div>
          <h1 class="text-xl font-semibold md:text-2xl">
            ${capitalize(data?.name)}'s Story
          </h1>
          <p class="text-grey-70 max-w-max text-sm font-light">
            ${showFormattedDate(data?.createdAt, 'id-ID')}
          </p>
        </div>
      </div>
      <p
        class="text-grey-70 bg-grey-70/10 mt-4 max-w-max rounded-full px-4 py-1.5 text-sm"
      >
        <i class="fas fa-md fa-map-marker-alt mr-1"></i>
        ${data?.placeName ?? 'Unknown Location'}
      </p>
      <p class="text-grey-80 mt-4 wrap-break-word md:mt-5">
        ${data?.description}
      </p>`;
  }

  renderImage(data) {
    document.getElementById('story-image').innerHTML = html` <div
        class="absolute inset-0 z-10 scale-105 bg-cover bg-top blur-sm"
        style="background-image: url('${data?.photoUrl}')"
      ></div>
      <img
        src="${data?.photoUrl}"
        class="relative z-20 h-full w-full rounded-lg object-contain"
        alt="${data?.name}'s story at ${data?.placeName}"
      />`;
  }

  populateStoryData(data) {
    this.renderStory(data);
    this.renderImage(data);

    if (this.#map) {
      const reportCoordinate = [data.lat, data.lon];
      const markerOptions = { alt: data.placeName };
      const popupOptions = {
        content: data.placeName,
      };
      this.#map.changeCamera(reportCoordinate);
      this.#map.addMarker(reportCoordinate, markerOptions, popupOptions);
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
