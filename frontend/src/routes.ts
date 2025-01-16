import { RouteDefinition } from '@lib/router';

const ROUTES: RouteDefinition[] = [
  {
    name: 'home',
    path: '/',
    component: async () => (await import('./pages/HomePage')).default
  }
];

export { ROUTES };
