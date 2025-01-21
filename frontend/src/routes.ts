import NotFoundPageComponent from './pages/NotFoundPage';
import { RouteDefinition } from '@lib/router';

const ROUTES: RouteDefinition[] = [
  {
    name: 'home',
    path: '/',
    component: async () => (await import('./pages/HomePage')).default
  },
  {
    name: 'auth',
    path: '/auth',
    children: [
      {
        name: 'login',
        path: '/login',
        title: 'PiXer - Login',
        component: async () => (await import('./pages/auth/LoginPage')).default
      },
      {
        name: 'register',
        path: '/register',
        title: 'PiXer - Register',
        component: async () => (await import('./pages/auth/RegisterPage')).default
      },
      {
        name: 'password',
        path: '/password',
        title: 'PiXer - Password',
        component: async () => (await import('./pages/auth/PasswordPage')).default
      }
    ]
  },
  {
    name: 'not-found',
    path: '**',
    component: NotFoundPageComponent
  }
];

export { ROUTES };
