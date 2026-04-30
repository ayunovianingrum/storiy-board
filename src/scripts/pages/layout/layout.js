import { html } from '../../utils/html';

export default class MainLayout {
  async render() {
    return html`
      <app-button
        label="Skip to Main Content"
        id="skip-link"
        size="sm"
        class="fixed z-10000 -translate-y-full px-2 py-1 transition-transform focus-within:translate-y-0 focus:translate-y-0"
      ></app-button>
      <navigation-bar></navigation-bar>
      <main id="main-content" class="main-content"></main>
      <footer-area></footer-area>
    `;
  }

  afterRender() {}
}
