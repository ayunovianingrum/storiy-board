import { isReallyOnline } from './index';
import { syncPendingStories } from '../data/api';

let isSyncing = false;

async function trySync() {
  if (isSyncing) return;

  try {
    isSyncing = true;
    const online = await isReallyOnline();
    if (online) {
      await syncPendingStories();
    }
  } catch (err) {
    console.error('SyncManager: Manual sync failed:', err);
  } finally {
    isSyncing = false;
  }
}

export async function initSyncManager(registration) {
  await trySync();

  window.addEventListener('online', async () => {
    if ((await isReallyOnline()) && !('sync' in registration)) {
      await trySync();
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'STORIES_SYNCED') {
        window.dispatchEvent(new CustomEvent('stories:synced'));
      }
    });
  }
}
