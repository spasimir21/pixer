import { AuthenticationServiceManager } from '../service/AuthenticationService';
import { ProfileButtonComponent } from '../components/buttons/ProfileButton';
import { AuthenticatedRoute } from '../components/AuthenticatedRoute';
import { useLocalization } from '../service/LocalizationService';
import { Component, useChildComponents } from '@lib/component';
import { HeaderComponent } from '../components/Header';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { useTitle } from '@lib/router';

const HomePageComponent = Component((): UINode => {
  const [Header, ProfileButton] = useChildComponents(HeaderComponent, ProfileButtonComponent);

  const authService = useService(AuthenticationServiceManager);
  const l = useLocalization();

  useTitle(() => `${l('pixer.title')} (${authService.user?.username})`);

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col">
      ${Header({
        title: () => l('pixer.title'),
        right: ProfileButton
      })}

      <div class="flex-grow"></div>
    </div>
  `;
});

export default AuthenticatedRoute(HomePageComponent);
