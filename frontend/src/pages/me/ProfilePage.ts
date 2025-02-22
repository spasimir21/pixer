import { faFolderClosed, faImage, faCalendar, faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { ProfileIconUploadComponent } from '../../components/ProfileIcon/ProfileIconUpload';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { LogOutButtonComponent } from '../../components/buttons/LogOutButton';
import { Component, useChildComponents, useState } from '@lib/component';
import { AuthenticatedRoute } from '../../components/AuthenticatedRoute';
import { faLink, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useLocalization } from '../../service/LocalizationService';
import { APIServiceManager } from '../../service/APIService';
import { HeaderComponent } from '../../components/Header';
import { useNavigation, useTitle } from '@lib/router';
import { IconComponent } from '../../components/Icon';
import { UserOwnStats } from '@api/dto/userStats';
import { requests } from '../../api/requests';
import { formatDate } from '../../misc/date';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { BackButtonComponent } from '../../components/buttons/BackButton';
import { LanguageToggleComponent } from '../../components/LanguageToggle';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

const ProfilePageComponent = Component((): UINode => {
  const [Header, ProfileIconUpload, Icon, BackButton, LogOutButton, LanguageToggle] = useChildComponents(
    HeaderComponent,
    ProfileIconUploadComponent,
    IconComponent,
    BackButtonComponent,
    LogOutButtonComponent,
    LanguageToggleComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();

  useTitle(() => `${l('pixer.title')} - ${l('me.profile.title')} (${authService.user?.username})`);

  const ownStats = useState<UserOwnStats | null>(null);

  apiService.send(requests.user.getOwnStats, {}).then(({ error, result }) => {
    if (error || result == null) {
      navigate({ route: 'home' }, true);
      return;
    }

    $ownStats = result;
  });

  const share = () => {
    const shareUrl = `${import.meta.env.VITE_ORIGIN}/user/${authService.user?.username}`;

    if (!Capacitor.isNativePlatform()) {
      navigator.clipboard.writeText(shareUrl);
      return;
    }

    Share.share({
      dialogTitle: `Share your PiXer Account`,
      text: `Follow ${authService.user?.username} on PiXer`,
      url: shareUrl
    });
  };

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: BackButton,
        title: () => l('me.profile.title'),
        right: LogOutButton
      })}
      ${LanguageToggle()}

      <div class="flex-grow flex flex-col items-center pt-6 gap-6 w-full max-w-[430px]">
        ${ProfileIconUpload()}

        <div class="flex items-center gap-3">
          <div class="w-8"></div>

          <p class="font-bold text-gray-800 text-2xl">${authService.user?.username}</p>

          <div class="bg-blue-500 rounded-xl w-8 h-8 grid place-items-center cursor-pointer" @click=${share}>
            ${Icon({ icon: faLink, fill: 'white', classes: 'w-5' })}
          </div>
        </div>

        <div class="flex gap-4 w-full px-6">
          <button
            class="outline-none bg-gray-300 text-gray-700 font-bold text-xl rounded-lg flex gap-3 items-center justify-center py-3 flex-grow"
            @click=${() => navigate({ route: 'me.friends' })}>
            ${Icon({ icon: faUserGroup, fill: 'rgb(55 65 81)', classes: 'w-6' })} ${$ownStats?.friends ?? '??'}
            ${l('me.profile.friends')}
          </button>

          <button
            class="outline-none bg-blue-500 text-white font-bold text-xl rounded-lg flex gap-3 items-center justify-center py-3 flex-grow"
            @click=${() => navigate({ route: 'me.requests' })}>
            ${Icon({ icon: faEnvelope, fill: 'white', classes: 'w-6' })} ${$ownStats?.requests ?? '??'}
            ${l('me.profile.requests')}
          </button>
        </div>

        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-4">
            ${Icon({ icon: faCalendar, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">
              ${l('me.profile.joinedOn')}
              <span class="font-bold">${$ownStats == null ? '??/??/????' : formatDate($ownStats!.createdAt)}</span>
            </p>
          </div>

          <div class="flex items-center gap-4">
            ${Icon({ icon: faImage, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">
              <span class="font-bold">${$ownStats?.uploadedImages ?? '??'}</span> ${l('me.profile.uploadedImages')}
            </p>
          </div>

          <div class="flex items-center gap-4">
            ${Icon({ icon: faFolderClosed, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">
              <span class="font-bold">${$ownStats?.createdAlbums ?? '??'}</span> ${l('me.profile.createdAlbums')}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
});

export default AuthenticatedRoute(ProfilePageComponent);
