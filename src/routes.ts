import { UserIdComponent } from './pages/user/UserId';
import { NotFoundComponent } from './pages/NotFound';
import { UserComponent } from './pages/user/User';
import { RouteDefinition } from '@lib/router';

const ROUTES: RouteDefinition[] = [
  {
    name: 'user',
    path: '/user',
    component: UserComponent,
    children: [
      {
        name: 'id',
        path: '/[id]',
        component: UserIdComponent
      }
    ]
  },
  {
    name: 'not-found',
    path: '**',
    component: NotFoundComponent
  }
];

export { ROUTES };
