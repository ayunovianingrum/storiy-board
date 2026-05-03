import { getAccessToken } from '../utils/auth';

export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  const segments = pathname.split('/').filter(Boolean);
  return {
    resource: segments[0] || null,
    id: segments[1] || null,
  };
}

export function getActiveRoute() {
  const { resource, id } = parseActivePathname();

  if (!resource) return '/';
  if (resource && id) return '/story/:id';
  return `/${resource}`;
}

export function getRoute(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (!segments[0]) return '/';
  if (segments[1]) return '/story/:id';
  return `/${segments[0]}`;
}

export const unauthenticatedRoutesOnly = ['/login', '/register'];

export async function resolveFinalRoute() {
  const currentRoute = getActiveRoute();

  const token = await getAccessToken();
  const isLoggedIn = !!token;

  const isPublicRoute = unauthenticatedRoutesOnly.includes(currentRoute);

  if (!isLoggedIn && !isPublicRoute) {
    if (typeof window !== 'undefined') {
      window.location.hash = '/login';
    }
    return '/login';
  }

  if (isLoggedIn && isPublicRoute) {
    if (typeof window !== 'undefined') {
      window.location.hash = '/';
    }
    return '/';
  }

  return currentRoute;
}
