import { faFolderClosed, faImage, faCalendar, faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { ProfileIconUploadComponent } from '../../components/ProfileIcon/ProfileIconUpload';
import { faDoorOpen, faLink, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { AuthenticatedRoute } from '../../components/AuthenticatedRoute';
import { Component, useChildComponents } from '@lib/component';
import { HeaderComponent } from '../../components/Header';
import { useNavigation, useTitle } from '@lib/router';
import { IconComponent } from '../../components/Icon';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const ProfilePageComponent = Component((): UINode => {
  const [Header, ProfileIconUpload, Icon] = useChildComponents(
    HeaderComponent,
    ProfileIconUploadComponent,
    IconComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const { navigate } = useNavigation();

  useTitle(() => `PiXer - Profile (${authService.user?.username})`);

  const logout = () => {
    authService.logOut();
    navigate({ route: 'auth.login' });
  };

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col">
      ${Header({
        title: () => 'User Profile',
        button: () =>
          html`<div class="w-9 grid place-items-center" @click=${logout}>
            ${Icon({
              icon: faDoorOpen,
              fill: 'rgb(55 65 81)',
              classes: 'w-8'
            })}
          </div>`
      })}

      <div class="flex-grow flex flex-col items-center pt-6 gap-6">
        ${ProfileIconUpload()}

        <div class="flex items-center gap-3">
          <div class="w-8"></div>

          <p class="font-bold text-gray-800 text-2xl">${authService.user?.username}</p>

          <div class="bg-blue-500 rounded-xl w-8 h-8 grid place-items-center">
            ${Icon({ icon: faLink, fill: 'white', classes: 'w-5' })}
          </div>
        </div>

        <div class="flex gap-4 w-full px-6">
          <button
            class="outline-none bg-gray-300 text-gray-700 font-bold text-xl rounded-lg flex gap-3 items-center justify-center py-3 flex-grow">
            ${Icon({ icon: faUserGroup, fill: 'rgb(55 65 81)', classes: 'w-6' })} 0 Friends
          </button>

          <button
            class="outline-none bg-blue-500 text-white font-bold text-xl rounded-lg flex gap-3 items-center justify-center py-3 flex-grow">
            ${Icon({ icon: faEnvelope, fill: 'white', classes: 'w-6' })} 0 Requests
          </button>
        </div>

        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-4">
            ${Icon({ icon: faCalendar, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl">Joined on <span class="font-bold">24/34/2004</span></p>
          </div>

          <div class="flex items-center gap-4">
            ${Icon({ icon: faImage, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl"><span class="font-bold">67</span> Uploaded Images</p>
          </div>

          <div class="flex items-center gap-4">
            ${Icon({ icon: faFolderClosed, fill: 'rgb(55 65 81)', classes: 'w-6' })}
            <p class="text-gray-700 text-xl"><span class="font-bold">5</span> Created Albums</p>
          </div>
        </div>
      </div>
    </div>
  `;
});

export default AuthenticatedRoute(ProfilePageComponent);
