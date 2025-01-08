import { UserPageComponent } from './pages/UserPage';
import { RouteDefinition } from '@lib/router';

const ROUTES: RouteDefinition[] = [
  {
    name: 'user',
    path: '/[id]',
    component: UserPageComponent
  }
];

export { ROUTES };
