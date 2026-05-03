import { isServiceWorkerAvailable } from '../../utils';
import { subscribeButton } from '../../template';
import {
  subscribe,
  unsubscribe,
  isCurrentPushSubscriptionAvailable,
} from '../../utils/notification-helper';

export default class MainLayout {
  isProcessing = false;

  constructor() {
    this.handleClick = this.#handleClick.bind(this);
  }

  async render() {
    return `
      <app-button
        label="Skip to Main Content"
        id="skip-link"
        size="sm"
        class="fixed z-10000 -translate-y-full px-2 py-1 transition-transform focus-within:translate-y-0 focus:translate-y-0"
      ></app-button>
      <navigation-bar></navigation-bar>
      <main id="main-content" class="main-content"></main>
      <footer-area></footer-area>
      <snack-bar id="snackbar"></snack-bar>
    `;
  }

  async afterRender() {
    if (isServiceWorkerAvailable()) {
      await this.#renderPushNotificationUI();
      this.#setupPushNotification();
    }
  }

  async #renderPushNotificationUI() {
    const container = document.getElementById('push-notification-tools');
    if (!container) return;

    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    const taskToDo = isSubscribed ? 'unsubscribe' : 'subscribe';

    container.innerHTML = subscribeButton(taskToDo);
  }

  #setupPushNotification() {
    const container = document.getElementById('push-notification-tools');
    if (!container) return;

    container.addEventListener('click', this.handleClick);
  }

  async #handleClick(e) {
    const button = e.target.closest('#subscribe-button');
    const task = button.dataset.task;

    if (this.isProcessing) return;

    let endpoint = null;

    if (task === 'subscribe') endpoint = subscribe;
    if (task === 'unsubscribe') endpoint = unsubscribe;

    if (!endpoint) return;

    try {
      this.isProcessing = true;

      const loader = document.getElementById('is-loading');
      loader?.classList.remove('hidden');

      await endpoint(this.showSnackbar);

      await this.#renderPushNotificationUI();
    } finally {
      this.isProcessing = false;

      const loader = document.getElementById('is-loading');
      loader?.classList.add('hidden');
    }
  }

  showSnackbar(message, type) {
    document.getElementById('snackbar')?.show(message, type);
  }
}
