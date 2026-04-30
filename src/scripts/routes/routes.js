import HomePage from '../pages/home/home-page';
import AuthPage from '../pages/auth/auth-page';
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from '../utils/auth';
import NewStoryPage from '../pages/new-story/new-story-page';
import DetailStoryPage from '../pages/detail-story/detail-story-page';

const routes = {
  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/login': (app) => checkUnauthenticatedRouteOnly(new AuthPage('login', app)),
  '/register': (app) =>
    checkUnauthenticatedRouteOnly(new AuthPage('register', app)),
  '/new-story': () => checkAuthenticatedRoute(new NewStoryPage()),
  '/story/:id': () => checkAuthenticatedRoute(new DetailStoryPage()),
};

export default routes;
