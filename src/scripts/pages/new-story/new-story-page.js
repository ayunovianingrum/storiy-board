import NewStoryPresenter from './new-story-presenter';
import { convertBase64ToBlob } from '../../utils';
import * as StoryAPI from '../../data/api';
import Camera from '../../utils/camera';
import Map from '../../utils/map';
import { html } from '../../utils/html';
import MainLayout from '../layout/layout';
import {
  validateNewStory,
  attachNewStoryLiveValidation,
} from '../../validation/custom-new-story-validation';

export default class NewStoryPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #photoData = null;
  #cameraActionBound = false;
  #map = null;

  async render() {
    return html`
      <section
        class="m-auto flex min-h-screen max-w-[85%] items-center pt-30 pb-4 md:w-full md:pt-35"
      >
        <div
          class="relative m-auto flex h-full w-full flex-col justify-between overflow-hidden rounded-4xl p-4 md:flex-row lg:max-w-[90%]"
        >
          <div
            class="absolute inset-0 z-10 scale-105 bg-[url('/images/login-bg.jpg')] bg-cover bg-center blur-md"
          ></div>
          <header class="z-20 p-4">
            <app-button
              custom-class="text-white! border-white! [&:not(.cs-btn-loading):hover]:bg-white/30!"
              id="back-btn"
              label="Back"
              left-icon="<i class='fas fa-sm fa-chevron-down rotate-90 mr-2'></i>"
              variant="secondary"
              size="sm"
            ></app-button>
            <h1
              class="mt-7 text-2xl font-medium text-white md:mt-10 md:text-3xl"
            >
              Add <span class="cs-tag-text-outlined">New</span> <br />
              Story
            </h1>
            <p class="py-4 font-light text-white md:pb-0">
              <span class="font-medium">Got something interesting?</span>
              <br />
              Share it as a story for others to see.
            </p>
          </header>
          <section
            id="content"
            class="bg-base-dark z-20 h-full w-full rounded-3xl p-6 md:px-14 md:py-10"
          >
            <form id="new-story-form">
              <div>
                <label for="description-input" class="cs-label">
                  Description
                </label>
                <textarea
                  class="cs-textarea"
                  id="desc-input"
                  name="description"
                  placeholder="Share your learning experience, project journey, or insights from what you’ve been working on."
                  aria-describedby="err-message-description"
                ></textarea>
                <div
                  id="err-message-description"
                  class="cs-err-message mt-2"
                ></div>
              </div>
              <div>
                <label for="doc-input" class="cs-label">Photo</label>
                <div class="cs-more-info">
                  Add a photo to support and make your story more meaningful.
                </div>
                <div class="pt-2">
                  <app-button
                    id="doc-input-button"
                    class="btn btn-outline"
                    type="button"
                    label="Upload Photo"
                    size="sm"
                  ></app-button>
                  <input
                    id="doc-input"
                    name="photo"
                    type="file"
                    accept="image/*"
                    hidden="hidden"
                    aria-multiline="true"
                    aria-describedby="err-message-photo"
                  />
                  <app-button
                    id="open-doc-camera-button"
                    custom-class="btn btn-outline mt-2"
                    type="button"
                    label="Use Camera"
                    variant="secondary"
                    size="sm"
                  ></app-button>
                  <p id="err-message-photo" class="cs-err-message"></p>
                </div>
                <div>
                  <div
                    id="camera-container"
                    class="cs-cam-canvas-container border-grey-50 my-4 hidden rounded-[20px] border p-3 md:p-5"
                  >
                    <video id="camera-video" class="w-full rounded-xl">
                      Video stream not available.
                    </video>
                    <canvas id="camera-canvas" class="hidden"></canvas>

                    <div>
                      <select
                        id="camera-select"
                        class="my-2 block w-full truncate"
                      ></select>
                      <div class="">
                        <app-button
                          id="camera-take-button"
                          size="sm"
                          label="Capture Photo"
                        >
                        </app-button>
                      </div>
                    </div>
                  </div>
                  <ul id="doc-list" class="mb-2 flex flex-wrap gap-2"></ul>
                  <hr class="text-grey-40 mt-6" />
                </div>
              </div>
              <div>
                <div class="new-form__location__container">
                  <p class="cs-label mt-4 mb-2">Location</p>
                  <div class="relative h-62.5 rounded-2xl">
                    <div id="map" class="h-full rounded-2xl"></div>
                    <div
                      id="map-loading-container"
                      class="skeleton absolute hidden h-full w-full rounded-2xl p-6 transition"
                    >
                      <div class="loader loader-absolute"></div>
                    </div>
                  </div>
                  <div class="mt-2 flex w-full gap-2">
                    <div class="w-full">
                      <label for="latitude" class="cs-label">Latitude</label>
                      <input
                        class="cs-input"
                        type="number"
                        name="latitude"
                        value="-6.175389"
                        disabled
                      />
                    </div>
                    <div class="w-full">
                      <label for="longitude" class="cs-label">Longitude</label>
                      <input
                        class="cs-input"
                        type="number"
                        name="longitude"
                        value="106.827139"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="mt-10 flex flex-col justify-end gap-2 md:mt-16 md:flex-row"
              >
                <app-button
                  class="md:order-1"
                  id="submit-btn"
                  custom-class="w-full md:w-37.5"
                  type="submit"
                  label="Share Story"
                >
                </app-button>
                <app-button
                  class="md:order-0"
                  id="cancel-btn"
                  custom-class="w-full md:w-37.5"
                  type="button"
                  label="Cancel"
                  variant="secondary"
                >
                </app-button>
              </div>
            </form>
          </section>
        </div>
        <snack-bar id="snackbar" position="bottom"></snack-bar>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewStoryPresenter({
      view: this,
      model: StoryAPI,
    });

    this.#presenter.init();
    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById('new-story-form');

    const MAX_SIZE = 1 * 1024 * 1024; // 1MB

    document
      .getElementById('doc-input')
      .addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 1 * 1024 * 1024;
        const errorEl = document.getElementById('err-message-photo');

        if (file.size > MAX_SIZE) {
          errorEl.innerText =
            'The photo is too large. Please upload one under 1MB.';
          event.target.value = '';
          return;
        }

        errorEl.innerText = '';

        await this.#insertPhotoData(file);

        event.target.value = '';
      });

    document
      .getElementById('doc-input-button')
      .addEventListener('click', () => {
        this.#form.elements.namedItem('doc-input').click();
      });

    document.getElementById('back-btn').addEventListener('click', () => {
      this.redirectToHome();
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
      this.redirectToHome();
    });

    document
      .getElementById('open-doc-camera-button')
      .addEventListener('click', async (event) => {
        if (this.#isCameraOpen) {
          this.#closeCamera(event);
        } else {
          await this.#setupCamera(event);
        }
      });
  }

  initLiveValidation() {
    const form = document.getElementById('new-story-form');

    attachNewStoryLiveValidation(form);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
      locate: true,
    });

    const centerCoordinate = this.#map.getCenter();
    this.#updateLatLngInput(
      centerCoordinate.latitude,
      centerCoordinate.longitude,
    );

    const draggableMarker = this.#map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: 'true' },
    );
    draggableMarker.addEventListener('move', (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this.#map.addMapEventListener('click', (event) => {
      draggableMarker.setLatLng(event.latlng);
      event.sourceTarget.flyTo(event.latlng);
    });
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem('latitude').value = latitude;
    this.#form.elements.namedItem('longitude').value = longitude;
  }

  async #setupCamera(event) {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video'),
        cameraSelect: document.getElementById('camera-select'),
        canvas: document.getElementById('camera-canvas'),
      });
    }

    try {
      await this.#camera.launch();

      document.getElementById('err-message-photo').innerText = '';

      await this.#showCamera(true, event);

      this.#attachCameraActions();
    } catch (error) {
      console.error(`cameraError: ${error}`);

      document.getElementById('err-message-photo').innerText =
        'Camera access is required. Please allow access to use your camera';
    }
  }

  async #showCamera(open, event) {
    const cameraContainer = document.getElementById('camera-container');
    const cameraButton = document.getElementById('open-doc-camera-button');

    if (open) {
      cameraContainer.classList.add('open');
      this.#isCameraOpen = true;
      this.#updatePhotoButtons();
    } else {
      cameraContainer.classList.remove('open');
      this.#isCameraOpen = false;
      this.#updatePhotoButtons();
    }
  }

  #closeCamera(event) {
    const cameraContainer = document.getElementById('camera-container');
    const cameraButton = document.getElementById('open-doc-camera-button');
    this.#camera.stop();

    cameraContainer.classList.remove('open');
    this.#isCameraOpen = false;

    this.#updatePhotoButtons();
  }

  #attachCameraActions() {
    if (this.#cameraActionBound) return;

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();
      await this.#insertPhotoData(image);
    });

    this.#cameraActionBound = true;
  }

  async #insertPhotoData(image) {
    let blob = image;

    if (typeof image === 'string') {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    this.#photoData = {
      id: `${Date.now()}`,
      blob,
    };

    this.validatePhoto();
    this.#renderPhoto();
    this.#updatePhotoButtons();
  }

  async #renderPhoto() {
    const container = document.getElementById('doc-list');

    if (!this.#photoData) {
      container.innerHTML = '';
      return;
    }

    const url = URL.createObjectURL(this.#photoData.blob);

    document.getElementById('doc-list').innerHTML = html`<li
      class="relative flex h-30 w-30 flex-col items-center justify-center rounded-2xl bg-white p-2 md:h-45 md:w-45"
    >
      <img
        src="${url}"
        alt="Photo uploaded"
        class="max-h-full max-w-full rounded-lg"
      />
      <button
        type="button"
        id="remove-photo"
        class="bg-grey-90/10 absolute right-3 bottom-3 h-10 w-10 cursor-pointer rounded-lg p-2 backdrop-blur-xl"
      >
        <i class="fas fa-trash text-primary-50"></i>
      </button>
    </li>`;

    document
      .getElementById('remove-photo')
      .addEventListener('click', (event) => {
        this.#removePhoto();
      });
  }

  #removePhoto() {
    this.#photoData = null;
    this.validatePhoto();
    this.#renderPhoto();
    this.#updatePhotoButtons();
  }

  #updatePhotoButtons() {
    const hasPhoto = !!this.#photoData;
    const uploadBtn = document.getElementById('doc-input-button');
    const cameraBtn = document.getElementById('open-doc-camera-button');

    uploadBtn.setAttribute(
      'label',
      hasPhoto ? 'Replace Photo' : 'Upload Photo',
    );

    cameraBtn.setAttribute(
      'label',
      this.#isCameraOpen
        ? 'Stop Camera'
        : hasPhoto
          ? 'Replace with Camera'
          : 'Use Camera',
    );
  }

  validatePhoto() {
    const el = document.getElementById('err-message-photo');

    if (!this.#photoData) {
      el.innerText = 'Please upload a photo';
      return false;
    }

    el.innerText = '';
    return true;
  }

  redirectToHome() {
    this.clearForm();
    location.hash = '/';
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById('map-loading-container').classList.remove('hidden');
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').classList.add('hidden');
  }

  updateStateButton(state) {
    const cancelButton = document.getElementById('cancel-btn');
    const submitButton = document.getElementById('submit-btn');
    const backButton = document.getElementById('back-btn');

    submitButton.setButtonState(state);
    cancelButton.setButtonState({ ...state, label: 'Cancel' });
    backButton.setButtonState({ ...state, label: 'Back' });
  }

  showSnackbar(message, type) {
    document.getElementById('snackbar').show(message, type);
  }

  bindSubmit(handler) {
    const form = document.getElementById('new-story-form');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const payload = this.getFormData();

      await handler(payload);
    });
  }

  getFormData() {
    return {
      description: document.getElementById('desc-input').value,
      latitude: document.querySelector('input[name="latitude"]').value,
      longitude: document.querySelector('input[name="longitude"]').value,
      photo: this.#photoData?.blob,
    };
  }

  validate(data) {
    return validateNewStory(data);
  }

  showErrors(errors) {
    errors.forEach(({ field, message }) => {
      const el = document.getElementById(`err-message-${field}`);
      if (el) el.innerText = message;
    });
  }
}
