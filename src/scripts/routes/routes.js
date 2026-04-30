import HomePage from '../pages/home/home-page';
import AuthPage from '../pages/auth/auth-page';
import NewStoryPage from '../pages/new-story/new-story-page';
import DetailStoryPage from '../pages/detail-story/detail-story-page';

const routes = {
  '/': () => new HomePage(),
  '/login': (app) => new AuthPage('login', app),
  '/register': (app) => new AuthPage('register', app),
  '/new-story': () => new NewStoryPage(),
  '/story/:id': () => new DetailStoryPage(),
};

export default routes;
