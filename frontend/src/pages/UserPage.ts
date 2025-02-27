import { faCalendar, faFolderClosed, faImage, IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { NavigateToComponent, useNavigation, useRoute, useTitle } from '@lib/router';
import { AuthenticationServiceManager } from '../service/AuthenticationService';
import { ProfileIconComponent } from '../components/ProfileIcon/ProfileIcon';
import { Component, useChildComponents, useState } from '@lib/component';
import { BackButtonComponent } from '../components/buttons/BackButton';
import { AuthenticatedRoute } from '../components/AuthenticatedRoute';
import { useLocalization } from '../service/LocalizationService';
import { FriendStatus, UserStats } from '@api/dto/userStats';
import { APIServiceManager } from '../service/APIService';
import { HeaderComponent } from '../components/Header';
import { IconComponent } from '../components/Icon';
import LoadingPageComponent from './LoadingPage';
import { TranslationKey } from '../lang/en';
import { requests } from '../api/requests';
import { formatDate } from '../misc/date';
import { useService } from '@lib/service';
import {
  faEnvelopeCircleCheck,
  faLink,
  faUserGroup,
  faEnvelope,
  faUserCheck,
  faEnvelopeOpen
} from '@fortawesome/free-solid-svg-icons';
import { html, UINode } from '@lib/ui';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

const friendButtonTextMap: Record<FriendStatus, TranslationKey> = {
  [FriendStatus.Friends]: 'user.profile.friendStatus.friends',
  [FriendStatus.NotFriends]: 'user.profile.friendStatus.sendRequest',
  [FriendStatus.RequestSent]: 'user.profile.friendStatus.cancelRequest',
  [FriendStatus.RequestWaiting]: 'user.profile.friendStatus.acceptRequest'
};

const friendButtonIconMap: Record<FriendStatus, IconDefinition> = {
  [FriendStatus.Friends]: faUserCheck,
  [FriendStatus.NotFriends]: faEnvelope,
  [FriendStatus.RequestSent]: faEnvelopeOpen,
  [FriendStatus.RequestWaiting]: faEnvelopeCircleCheck
};

const UserPageComponent = Component((): UINode => {
  const [NavigateTo, LoadingPage, Icon, Header, BackButton, ProfileIcon] = useChildComponents(
    NavigateToComponent,
    LoadingPageComponent,
    IconComponent,
    HeaderComponent,
    BackButtonComponent,
    ProfileIconComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();
  const route = useRoute();

  useTitle(() => `${l('pixer.title')} - ${$route.params.username}`);

  if ($route.params.username === authService.user?.username)
    return NavigateTo({ route: 'me.profile' }, LoadingPage, true);

  const userStats = useState<UserStats | null>(null);

  apiService
    .send(requests.user.getStats, { userId: null, username: $route.params.username })
    .then(({ error, result }) => {
      if (error || result == null) {
        navigate({ route: 'home' }, true);
        return;
      }

      $userStats = result;
    });

  const isDoingFriendAction = useState(false);

  const doFriendAction = async () => {
    if ($isDoingFriendAction || $userStats == null) return;

    $isDoingFriendAction = true;

    if ($userStats!.friendStatus === FriendStatus.NotFriends) {
      const response = await apiService.send(requests.friend.sendRequest, { to: $userStats!.id });

      if (response.error == null && response.result === true) $userStats!.friendStatus = FriendStatus.RequestSent;
    } else if ($userStats!.friendStatus === FriendStatus.RequestSent) {
      const response = await apiService.send(requests.friend.cancelRequest, { to: $userStats!.id });

      if (response.error == null && response.result === true) $userStats!.friendStatus = FriendStatus.NotFriends;
    } else if ($userStats!.friendStatus === FriendStatus.RequestWaiting) {
      const response = await apiService.send(requests.friend.acceptRequest, { from: $userStats!.id });

      if (response.error == null && response.result === true) {
        $userStats!.friendStatus = FriendStatus.Friends;
        $userStats!.friends++;
      }
    }

    $isDoingFriendAction = false;
  };

  const share = () => {
    const shareUrl = `${import.meta.env.VITE_ORIGIN}/user/${$route.params.username}`;

    if (!Capacitor.isNativePlatform()) {
      navigator.clipboard.writeText(shareUrl);
      return;
    }

    Share.share({
      dialogTitle: `Share ${$route.params.username}'s PiXer Account`,
      text: `Follow ${$route.params.username} on PiXer`,
      url: shareUrl
    });
  };

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: BackButton,
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

          <div class="bg-blue-500 rounded-xl w-8 h-8 grid place-items-center cursor-pointer" @click=${share}>
            ${Icon({ icon: faLink, fill: 'white', classes: 'w-5' })}
          </div>
        </div>

        <div class="flex gap-4 w-full px-6">
          <button
            class="outline-none bg-gray-300 text-gray-700 font-bold text-xl rounded-lg flex gap-3 items-center justify-center py-3 flex-grow cursor-default">
            ${Icon({ icon: faUserGroup, fill: 'rgb(55 65 81)', classes: 'w-6' })} ${$userStats?.friends ?? '??'}
            ${l('me.profile.friends')}
          </button>

          <button
            class="outline-none text-white font-bold text-xl rounded-lg flex gap-3 items-center justify-center py-3 flex-grow"
            .bg-green-500=${$userStats?.friendStatus === FriendStatus.Friends ||
            $userStats?.friendStatus === FriendStatus.RequestWaiting}
            .bg-red-500=${$userStats?.friendStatus === FriendStatus.RequestSent}
            .bg-blue-500=${$userStats?.friendStatus === FriendStatus.NotFriends}
            @click=${doFriendAction}>
            ${Icon({
              icon: () => ($userStats == null ? faUserGroup : friendButtonIconMap[$userStats!.friendStatus]),
              fill: 'white',
              classes: 'w-6'
            })}
            ${$userStats == null ? '...' : l(friendButtonTextMap[$userStats!.friendStatus])}
          </button>
        </div>

        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-4">
            ${Icon({ icon: faCalendar, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">
              ${l('me.profile.joinedOn')}
              <span class="font-bold">${$userStats == null ? '??/??/????' : formatDate($userStats!.createdAt)}</span>
            </p>
          </div>

          <div class="flex items-center gap-4">
            ${Icon({ icon: faImage, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">
              <span class="font-bold">${$userStats?.publicImages ?? '??'}</span> ${l('user.profile.publicImages')}
            </p>
          </div>

          <div class="flex items-center gap-4">
            ${Icon({ icon: faFolderClosed, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">
              <span class="font-bold">${$userStats?.publicAlbums ?? '??'}</span> ${l('user.profile.publicAlbums')}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
});

export default AuthenticatedRoute(UserPageComponent);
