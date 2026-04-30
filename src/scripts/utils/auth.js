import { getActiveRoute } from '../routes/url-parser';
import { STORAGE_KEYS } from '../config';

export function getAccessToken() {
  try {
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    const accessToken = userData?.ACCESS_TOKEN_KEY;

    if (accessToken === 'null' || accessToken === 'undefined') {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

export function putUserData(user) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('putUserData: error:', error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    return true;
  } catch (error) {
    console.error('getLogout: error:', error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ['/login', '/register'];

export function getLogout() {
  removeAccessToken();
}

export function resolveFinalRoute() {
  let currentRoute = getActiveRoute();
  const isLoggedIn = !!getAccessToken();

  if (
    !isLoggedIn &&
    currentRoute !== '/login' &&
    currentRoute !== '/register'
  ) {
    location.hash = '/login';
    return '/login';
  }

  if (
    isLoggedIn &&
    (currentRoute === '/login' || currentRoute === '/register')
  ) {
    location.hash = '/';
    return '/';
  }

  return currentRoute;
}
