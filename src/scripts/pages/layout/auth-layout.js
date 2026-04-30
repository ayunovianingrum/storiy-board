import { html } from '../../utils/html';

export default class AuthLayout {
  async render() {
    return html` <main id="main-content" class="main-content"></main> `;
  }

  afterRender() {}
}
