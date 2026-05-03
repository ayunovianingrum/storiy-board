import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';
import Database from '../database';

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,

  ALL_STORIES: `${BASE_URL}/stories`,
  ADD_NEW_STORY: `${BASE_URL}/stories`,
  DETAIL_STORY: (id) => `${BASE_URL}/stories/${id}`,
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories({ page, size, location = 0 }) {
  const accessToken = await getAccessToken();
  const url = new URL(ENDPOINTS.ALL_STORIES);

  url.searchParams.append('page', page);
  url.searchParams.append('size', size);
  url.searchParams.append('location', location);

  const fetchResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getDetailStory(id) {
  const accessToken = await getAccessToken();
  const url = new URL(ENDPOINTS.DETAIL_STORY(id));

  const fetchResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function addNewStory({ description, photo, lat, lon }) {
  const accessToken = await getAccessToken();

  const formData = new FormData();

  formData.set('description', description);
  formData.set('lat', lat);
  formData.set('lon', lon);
  formData.append('photo', photo);

  const fetchResponse = await fetch(ENDPOINTS.ADD_NEW_STORY, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function subscribePushNotification({
  endpoint,
  keys: { p256dh, auth },
}) {
  const accessToken = await getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = await getAccessToken();
  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function syncPendingStories() {
  const pending = await Database.getPendingStories();
  let anySync = false;

  for (const story of pending) {
    if (story.status !== 'pending') continue;

    await Database.updatePendingStory(story.id, { status: 'syncing' });

    const response = await addNewStory(story);

    if (!response.ok) {
      await Database.updatePendingStory(story.id, { status: 'pending' });
      console.error('sync failed for story:', story.id, response.message);
      continue;
    }
    anySync = true;
    await Database.deletePendingStory(story.id);
  }

  if (anySync) {
    anySync = false;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stories:synced'));
    } else {
      const allClients = await self.clients.matchAll();
      allClients.forEach((client) => {
        client.postMessage({ type: 'STORIES_SYNCED' });
      });
    }
  }
}
