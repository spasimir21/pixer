import { faFolderClosed, faImage, faCalendar, faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { ProfileIconUploadComponent } from '../../components/ProfileIcon/ProfileIconUpload';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { LogOutButtonComponent } from '../../components/buttons/LogOutButton';
import { HomeButtonComponent } from '../../components/buttons/HomeButton';
import { AuthenticatedRoute } from '../../components/AuthenticatedRoute';
import { faLink, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useLocalization } from '../../service/LocalizationService';
import { Component, useChildComponents } from '@lib/component';
import { HeaderComponent } from '../../components/Header';
import { IconComponent } from '../../components/Icon';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { useTitle } from '@lib/router';

const ProfilePageComponent = Component((): UINode => {
  const [Header, ProfileIconUpload, Icon, HomeButton, LogOutButton] = useChildComponents(
    HeaderComponent,
    ProfileIconUploadComponent,
    IconComponent,
    HomeButtonComponent,
    LogOutButtonComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const l = useLocalization();

  useTitle(() => `${l('pixer.title')} - ${l('me.profile.title')} (${authService.user?.username})`);

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: HomeButton,
        title: () => l('me.profile.title'),
        right: LogOutButton
      })}

      <div class="flex-grow flex flex-col items-center pt-6 gap-6 w-full max-w-[430px]">
        ${ProfileIconUpload()}

        <div class="flex items-center gap-3">
          <div class="w-8"></div>

          <p class="font-bold text-gray-800 text-2xl">${authService.user?.username}</p>

          <div class="bg-blue-500 rounded-xl w-8 h-8 grid place-items-center cursor-pointer">
            ${Icon({ icon: faLink, fill: 'white', classes: 'w-5' })}
          </div>
        </div>

        <div class="flex gap-4 w-full px-6">
          <button
            class="outline-none bg-gray-300 text-gray-700 font-bold text-xl rounded-lg flex gap-3 items-center justify-center py-3 flex-grow">
            ${Icon({ icon: faUserGroup, fill: 'rgb(55 65 81)', classes: 'w-6' })} 0 ${l('me.profile.friends')}
          </button>

          <button
            class="outline-none bg-blue-500 text-white font-bold text-xl rounded-lg flex gap-3 items-center justify-center py-3 flex-grow">
            ${Icon({ icon: faEnvelope, fill: 'white', classes: 'w-6' })} 0 ${l('me.profile.requests')}
          </button>
        </div>

        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-4">
            ${Icon({ icon: faCalendar, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">${l('me.profile.joinedOn')} <span class="font-bold">24/34/2004</span></p>
          </div>

          <div class="flex items-center gap-4">
            ${Icon({ icon: faImage, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl"><span class="font-bold">67</span> ${l('me.profile.uploadedImages')}</p>
          </div>

          <div class="flex items-center gap-4">
            ${Icon({ icon: faFolderClosed, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl"><span class="font-bold">5</span> ${l('me.profile.createdAlbums')}</p>
          </div>
        </div>
      </div>
    </div>
  `;
});

export default AuthenticatedRoute(ProfilePageComponent);
