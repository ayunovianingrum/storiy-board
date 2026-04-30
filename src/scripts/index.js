import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import './components';
import App from './pages/app';
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('.app'),
  });

  const handleRouteChange = async () => {
    await app.renderPage();
    Camera.stopAllStreams();
  };

  await handleRouteChange();

  window.addEventListener('hashchange', handleRouteChange);
});
