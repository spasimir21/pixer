import {
  faCheck,
  faEnvelopeCircleCheck,
  faLink,
  faUserGroup,
  faEnvelope,
  faEnvelopeOpen,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import { NavigateToComponent, useNavigation, useRoute, useTitle } from '@lib/router';
import { AuthenticationServiceManager } from '../service/AuthenticationService';
import { ProfileIconComponent } from '../components/ProfileIcon/ProfileIcon';
import { Component, useChildComponents, useState } from '@lib/component';
import { HomeButtonComponent } from '../components/buttons/HomeButton';
import { AuthenticatedRoute } from '../components/AuthenticatedRoute';
import { useLocalization } from '../service/LocalizationService';
import { FriendStatus, UserStats } from '@api/dto/userStats';
import { APIServiceManager } from '../service/APIService';
import { HeaderComponent } from '../components/Header';
import { IconComponent } from '../components/Icon';
import LoadingPageComponent from './LoadingPage';
import { faCalendar, faFolderClosed, faImage, IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { requests } from '../api/requests';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const friendButtonTextMap: Record<FriendStatus, string> = {
  'friends': 'Your Friend',
  'not-friends': 'Send Request',
  'request-sent': 'Request Sent',
  'request-waiting': 'Accept Request'
};

const friendButtonIconMap: Record<FriendStatus, IconDefinition> = {
  'friends': faUserCheck,
  'not-friends': faEnvelope,
  'request-sent': faEnvelopeOpen,
  'request-waiting': faEnvelopeCircleCheck
};

const UserPageComponent = Component((): UINode => {
  const [NavigateTo, LoadingPage, Icon, Header, HomeButton, ProfileIcon] = useChildComponents(
    NavigateToComponent,
    LoadingPageComponent,
    IconComponent,
    HeaderComponent,
    HomeButtonComponent,
    ProfileIconComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();
  const route = useRoute();

  useTitle(() => `${l('pixer.title')} - ${$route.params.username}`);

  if ($route.params.username === authService.user?.username) return NavigateTo({ route: 'me.profile' }, LoadingPage);

  const userStats = useState<UserStats | null>(null);

  apiService
    .send(requests.user.getStats, { userId: null, username: $route.params.username })
    .then(({ error, result }) => {
      if (error || result == null) {
        navigate({ route: 'home' });
        return;
      }

      $userStats = result;
    });

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: HomeButton,
        title: () => l('user.profile.title')
      })}

      <div class="flex-grow flex flex-col items-center pt-6 gap-6 w-full max-w-[430px]">
        ${ProfileIcon({
          userId: () => $userStats?.id ?? null,
          fullSize: true,
          classes: 'w-1/2 max-w-48 aspect-square rounded-full object-cover bg-gray-300'
        })}

        <div class="flex items-center gap-3">
          <div class="w-8"></div>

          <p class="font-bold text-gray-800 text-2xl">${$route.params.username}</p>

          <div class="bg-blue-500 rounded-xl w-8 h-8 grid place-items-center cursor-pointer">
            ${Icon({ icon: faLink, fill: 'white', classes: 'w-5' })}
          </div>
        </div>

        <div class="flex gap-4 w-full px-6">
          <button
            class="outline-none bg-gray-300 text-gray-700 font-bold text-xl rounded-lg flex gap-3 items-center justify-center py-3 flex-grow cursor-default"
          >
            ${Icon({ icon: faUserGroup, fill: 'rgb(55 65 81)', classes: 'w-6' })} ${$userStats?.friends ?? '??'}
            ${l('me.profile.friends')}
          </button>

          <button
            class="outline-none text-white font-bold text-xl rounded-lg flex gap-3 items-center justify-center py-3 flex-grow"
            .bg-green-500=${$userStats?.friendStatus === 'friends' || $userStats?.friendStatus === 'request-waiting'}
            .bg-blue-500=${$userStats?.friendStatus === 'request-sent' || $userStats?.friendStatus === 'not-friends'}
          >
            ${Icon({
              icon: $userStats == null ? faUserGroup : friendButtonIconMap[$userStats!.friendStatus],
              fill: 'white',
              classes: 'w-6'
            })}
            ${$userStats == null ? '...' : friendButtonTextMap[$userStats!.friendStatus]}
          </button>
        </div>

        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-4">
            ${Icon({ icon: faCalendar, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">
              ${l('me.profile.joinedOn')}
              <span class="font-bold"
                >${$userStats == null
                  ? '??/??/????'
                  : `${$userStats!.createdAt.getDate()}/${
                      $userStats!.createdAt.getMonth() + 1
                    }/${$userStats!.createdAt.getFullYear()}`}</span
              >
            </p>
          </div>

          <div class="flex items-center gap-4">
            ${Icon({ icon: faImage, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">
              <span class="font-bold">${$userStats?.uploadedImages ?? '??'}</span> ${l('me.profile.uploadedImages')}
            </p>
          </div>

          <div class="flex items-center gap-4">
            ${Icon({ icon: faFolderClosed, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">
              <span class="font-bold">${$userStats?.createdAlbums ?? '??'}</span> ${l('me.profile.createdAlbums')}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
});

export default AuthenticatedRoute(UserPageComponent);
