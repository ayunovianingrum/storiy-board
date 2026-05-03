import { STORAGE_KEYS } from '../config';

export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function capitalize(str = '') {
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function transitionHelper({ skipTransition = false, updateDOM }) {
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve().then(updateDOM);

    return {
      ready: Promise.resolve(),
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  const transition = document.startViewTransition(updateDOM);

  transition.finished.catch(() => {});
  transition.ready.catch(() => {});

  return transition;
}

export function convertBlobToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export function convertBase64ToBlob(
  base64Data,
  contentType = '',
  sliceSize = 512,
) {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (err) {
    console.error('SW failed:', err);
  }
}

export async function registerBackgroundSync() {
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-stories');
}

export async function isReallyOnline() {
  try {
    await fetch('/ping.json', { cache: 'no-store' });
    return true;
  } catch {
    return false;
  }
}

export function getUserName() {
  const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
  const name = userData?.USER_NAME || 'Your Name';

  return name;
}

export function scrollToStoryList() {
  const el = document.querySelector('#story-container');
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - 80, behavior: 'smooth' });
  }
}
