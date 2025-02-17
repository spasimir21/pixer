import { NotFoundPageComponent } from './pages/NotFoundPage';
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
        component: async () => (await import('./pages/auth/LoginPage')).default
      },
      {
        name: 'register',
        path: '/register',
        component: async () => (await import('./pages/auth/RegisterPage')).default
      },
      {
        name: 'password',
        path: '/password',
        component: async () => (await import('./pages/auth/PasswordPage')).default
      }
    ]
  },
  {
    name: 'me',
    path: '/me',
    children: [
      {
        name: 'profile',
        path: '/profile',
        component: async () => (await import('./pages/me/ProfilePage')).default
      },
      {
        name: 'friends',
        path: '/friends',
        component: async () => (await import('./pages/me/FriendsPage')).default
      },
      {
        name: 'requests',
        path: '/requests',
        component: async () => (await import('./pages/me/RequestsPage')).default
      }
    ]
  },
  {
    name: 'user',
    path: '/user/[username]',
    component: async () => (await import('./pages/UserPage')).default
  },
  {
    name: 'album',
    path: '/album',
    children: [
      {
        name: 'create',
        path: '/create',
        component: async () => (await import('./pages/album/CreateAlbumPage')).default
      },
      {
        name: 'view',
        path: '/[albumId]',
        component: async () => (await import('./pages/album/view/ViewAlbumPage')).default,
        children: [
          {
            name: 'images',
            path: '/',
            component: async () => (await import('./pages/album/view/AlbumImagesPage')).default
          },
          {
            name: 'info',
            path: '/info',
            component: async () => (await import('./pages/album/view/AlbumInfoPage')).default
          }
        ]
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
