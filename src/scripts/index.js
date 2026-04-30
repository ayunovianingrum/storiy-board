import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import './components';
import App from './pages/app';
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('.app'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    const hash = location.hash;

    await app.renderPage();
    Camera.stopAllStreams();
  });
});
