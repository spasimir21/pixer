import { AuthenticationServiceManager } from '../service/AuthenticationService';
import { Component, useChildComponents } from '@lib/component';
import { NavigateToComponent, useRoute } from '@lib/router';
import LoadingPageComponent from '../pages/LoadingPage';
import { useService } from '@lib/service';
import { UINode } from '@lib/ui';

const AuthenticatedRoute = (component: Component<() => UINode>) =>
  Component((): UINode => {
    const [childComponent, NavigateTo, LoadingPage] = useChildComponents(
      component,
      NavigateToComponent,
      LoadingPageComponent
    );

    const authService = useService(AuthenticationServiceManager);
    const route = useRoute();

    return authService.isAuthenticated
      ? childComponent()
      : NavigateTo(
          {
            route: 'auth.login',
            search: {
              redirectTo: $route.path ?? '/'
            }
          },
          LoadingPage
        );
  });

export { AuthenticatedRoute };
