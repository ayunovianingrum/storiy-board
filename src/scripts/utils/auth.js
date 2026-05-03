import { STORAGE_KEYS } from '../config';
import { set, get, del } from 'idb-keyval';

export async function getAccessToken() {
  try {
    const token = await get('auth-token');
    if (token) return token;

    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
      const accessToken = userData?.ACCESS_TOKEN_KEY;

      if (
        !accessToken ||
        accessToken === 'null' ||
        accessToken === 'undefined'
      ) {
        return null;
      }
      return accessToken;
    }

    return null;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

export async function putUserData(user) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    await set('auth-token', user.ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('putUserData: error:', error);
    return false;
  }
}

export async function removeAccessToken() {
  try {
    await del('auth-token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    return true;
  } catch (error) {
    console.error('removeAccessToken: error:', error);
    return false;
  }
}

export async function getLogout() {
  await removeAccessToken();
  if (typeof window !== 'undefined') {
    window.location.hash = '/login';
  }
}
