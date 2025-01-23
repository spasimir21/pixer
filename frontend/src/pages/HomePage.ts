import { AuthenticationServiceManager } from '../service/AuthenticationService';
import { ProfileIconComponent } from '../components/ProfileIcon/ProfileIcon';
import { AuthenticatedRoute } from '../components/AuthenticatedRoute';
import { Component, useChildComponents } from '@lib/component';
import { HeaderComponent } from '../components/Header';
import { useNavigation, useTitle } from '@lib/router';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const HomePageComponent = Component((): UINode => {
  const [Header, ProfileIcon] = useChildComponents(HeaderComponent, ProfileIconComponent);

  const authService = useService(AuthenticationServiceManager);
  const { navigate } = useNavigation();

  useTitle(() => `PiXer (${authService.user?.username})`);

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col">
      ${Header({
        title: () => 'PiXer',
        button: () => html`
          <div class="w-9 h-9" @click=${() => navigate({ route: 'user.profile' })}>
            ${ProfileIcon({
              userId: () => authService.user?.id ?? null,
              invalidatable: true,
              classes: 'w-9 h-9'
            })}
          </div>
        `
      })}

      <div class="flex-grow"></div>
    </div>
  `;
});

export default AuthenticatedRoute(HomePageComponent);
