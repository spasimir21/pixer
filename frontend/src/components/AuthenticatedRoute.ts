import { AuthenticationServiceManager } from '../service/AuthenticationService';
import { Component, useChildComponents, useTimeout } from '@lib/component';
import LoadingPageComponent from '../pages/LoadingPage';
import { useNavigation, useRoute } from '@lib/router';
import { useService } from '@lib/service';
import { UINode } from '@lib/ui';

const AuthenticatedRoute = (component: Component<() => UINode>) =>
  Component((): UINode => {
    const [childComponent, LoadingPage] = useChildComponents(component, LoadingPageComponent);

    const authService = useService(AuthenticationServiceManager);
    const { navigate } = useNavigation();
    const route = useRoute();

    if (!authService.isAuthenticated)
      useTimeout(
        () =>
          navigate({
            route: 'auth.login',
            search: {
              redirectTo: $route.path ?? '/'
            }
          }),
        0
      );

    return authService.isAuthenticated ? childComponent() : LoadingPage();
  });

export { AuthenticatedRoute };
