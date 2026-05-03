import { convertBase64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import {
  subscribePushNotification,
  unsubscribePushNotification,
} from '../data/api';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission(snackbar) {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    snackbar(
      `Notification permission was denied. Please try to reset site's permission settings`,
      'error',
    );
    return false;
  }

  if (status === 'default') {
    snackbar('Notification permission was dismissed or ignored', 'error');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe(snackbar) {
  if (!(await requestNotificationPermission(snackbar))) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    snackbar(`You're already subscribed to notifications`, 'success');
    return;
  }

  const failureSubscribeMessage = 'Failed to subscribe to notifications';
  const successSubscribeMessage = `You've subscribed to notifications`;

  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.ready;
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions(),
    );

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error('subscribe: response:', response);
      snackbar(failureSubscribeMessage, 'error');

      await pushSubscription.unsubscribe();

      return;
    }

    snackbar(successSubscribeMessage);
  } catch (error) {
    snackbar(failureSubscribeMessage, 'error');

    await pushSubscription.unsubscribe();
  }
}

export async function unsubscribe(snackbar) {
  const failureUnsubscribeMessage = 'Failed to unsubscribe from notifications';
  const successUnsubscribeMessage = 'You’ve unsubscribed from notifications';

  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      snackbar(
        'Cannot unsubscribe because you’re not subscribed to notifications',
        'error',
      );
      return;
    }

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });

    if (!response.ok) {
      snackbar(failureUnsubscribeMessage, 'error');
      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();

    if (!unsubscribed) {
      snackbar(failureUnsubscribeMessage, 'error');
      await subscribePushNotification({ endpoint, keys });
      return;
    }

    snackbar(successUnsubscribeMessage, 'success');
  } catch (error) {
    snackbar(failureUnsubscribeMessage, 'error');
  }
}
