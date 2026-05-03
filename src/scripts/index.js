import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import './components';
import App from './pages/app';
import Camera from './utils/camera';
import { initSyncManager } from './utils/sync-manager';
import { getActivePathname } from './routes/url-parser';
import { SCROLL_INTENT } from './config';
import { registerServiceWorker, scrollToStoryList } from './utils';

window.addEventListener('load', () => {
  if (sessionStorage.getItem('scrollIntent') === 'STORY') {
    sessionStorage.removeItem('scrollIntent');
    setTimeout(scrollToStoryList, 100);
  }
});

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

  const registration = await registerServiceWorker();
  if (registration) {
    await initSyncManager(registration);
  }

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SCROLL_INTENT') {
      const intent = event.data.intent;
      sessionStorage.setItem('scrollIntent', intent);

      const performScroll = () => {
        if (typeof scrollToStoryList === 'function') {
          requestAnimationFrame(() => {
            scrollToStoryList();
            sessionStorage.removeItem('scrollIntent');
          });
        }
      };

      if (document.readyState === 'complete') {
        performScroll();
      } else {
        document.addEventListener('readystatechange', performScroll, {
          once: true,
        });
      }

      setTimeout(performScroll, 250);
    }
  });
});
