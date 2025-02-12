import { AuthenticationServiceManager } from '../service/AuthenticationService';
import { ProfileButtonComponent } from '../components/buttons/ProfileButton';
import { AuthenticatedRoute } from '../components/AuthenticatedRoute';
import { useLocalization } from '../service/LocalizationService';
import { Component, useChildComponents } from '@lib/component';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { HeaderComponent } from '../components/Header';
import { useNavigation, useTitle } from '@lib/router';
import { IconComponent } from '../components/Icon';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const HomePageComponent = Component((): UINode => {
  const [Header, ProfileButton, Icon] = useChildComponents(HeaderComponent, ProfileButtonComponent, IconComponent);

  const authService = useService(AuthenticationServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();

  useTitle(() => `${l('pixer.title')} (${authService.user?.username})`);

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col">
      ${Header({
        title: () => l('pixer.title'),
        right: ProfileButton
      })}

      <div class="flex-grow">
        <div
          class="fixed bottom-3 left-3 w-10 h-10 rounded-full border-2 border-gray-400 bg-white grid place-items-center"
          @click=${() => navigate({ route: 'album.create' })}>
          ${Icon({
            icon: faPlus,
            fill: 'rgb(59 130 246)',
            classes: 'w-6'
          })}
        </div>

        <p class="text-center text-gray-700 text-lg mt-4">${l('home.noAlbums')}</p>
      </div>
    </div>
  `;
});

export default AuthenticatedRoute(HomePageComponent);
