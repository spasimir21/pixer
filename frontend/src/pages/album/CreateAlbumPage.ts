import { AlbumCoverUploadComponent } from '../../components/album/AlbumCoverUpload';
import { AuthenticatedRoute } from '../../components/AuthenticatedRoute';
import { useLocalization } from '../../service/LocalizationService';
import { Component, useChildComponents, useComputed, useEffect, useState } from '@lib/component';
import { HeaderComponent } from '../../components/Header';
import { IconComponent } from '../../components/Icon';
import { html, UINode } from '@lib/ui';
import { useNavigation, useTitle } from '@lib/router';
import { faInbox, faLock, faPlus, faUnlock, faUnlockAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { ProfileIconComponent } from '../../components/ProfileIcon/ProfileIcon';
import { useService } from '@lib/service';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { ValueNode } from '@lib/reactivity';
import { Friend } from '@api/dto/friend';
import { APIServiceManager } from '../../service/APIService';
import { requests } from '../../api/requests';
import { UserSelectComponent } from '../../components/user/UserSelect';
import { AlbumType } from '@api/dto/album';
import { toHex } from '@lib/utils/hex';
import { BackButtonComponent } from '../../components/buttons/BackButton';

const CreateAlbumPageComponent = Component((): UINode => {
  const [Header, BackButton, AlbumCoverUpload, Icon, ProfileIcon, UserSelect] = useChildComponents(
    HeaderComponent,
    BackButtonComponent,
    AlbumCoverUploadComponent,
    IconComponent,
    ProfileIconComponent,
    UserSelectComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();

  useTitle(() => `${l('pixer.title')} - ${l('album.create.title')}`);

  const name = useState('');
  const isPrivate = useState(true);
  const allowSubmissions = useState(false);
  const users = useState<Friend[]>([]);

  const isLoading = useState(false);

  const canCreate = useComputed(() => !$isLoading && $name.trim().length >= 3);

  useEffect(() => {
    if ($isPrivate) $allowSubmissions = false;
  });

  const friends = useState<Friend[]>([]);

  apiService.send(requests.friend.getFriends, {}).then(response => {
    if (response.error) return;
    $friends = response.result;
  });

  const removeUser = (user: Friend) => {
    $users.splice($users.indexOf(user), 1);
    $friends.push(user);
  };

  const addUser = (user: Friend) => {
    $friends.splice($friends.indexOf(user), 1);
    $users.push(user);
  };

  const uploadAlbumCover = useState(async (albumId: string) => false);
  const openUserSelect = useState(() => {});

  const createAlbum = async () => {
    if (!$canCreate) return;
    $isLoading = true;

    const response = await apiService.send(requests.album.create, {
      name: $name,
      type: $isPrivate ? AlbumType.PRIVATE : AlbumType.PUBLIC,
      allowSubmissions: $allowSubmissions,
      users: $users.map(user => user.id)
    });

    if (response.error == null && response.result != null) {
      await $uploadAlbumCover(response.result.id);

      navigate({ route: 'home' });

      return;
    }

    $isLoading = false;
  };

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: BackButton,
        title: () => l('album.create.title')
      })}

      <!-- Modal -->
      ${UserSelect({
        open: openUserSelect,
        users: friends,
        onUserSelected: addUser
      })}

      <div class="flex-grow flex flex-col w-full max-w-72 items-center pt-6 gap-6">
        ${AlbumCoverUpload({ upload: uploadAlbumCover, isPrivate, allowSubmissions })}

        <input
          type="text"
          class="border-gray-400 border-2 rounded-md text-xl outline-none px-2 py-1 w-full"
          placeholder=${l('album.create.albumName')}
          :value#=${$name} />

        <div class="flex items-center justify-between self-stretch">
          <div class="flex items-center gap-3">
            ${Icon({
              icon: faUnlock,
              fill: '#9ca3af',
              classes: 'w-4'
            })}

            <p class="text-xl text-gray-700">${l('album.create.public')}</p>
          </div>

          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked=${$isPrivate} class="sr-only peer" />
            <div
              class="relative w-11 h-6 bg-gray-300 outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>

          <div class="flex items-center gap-3">
            ${Icon({
              icon: faLock,
              fill: '#3b82f6',
              classes: 'w-4'
            })}

            <p class="text-xl text-gray-700">${l('album.create.private')}</p>
          </div>
        </div>

        <div class="flex items-center justify-between self-stretch">
          <div class="flex items-center gap-3">
            ${Icon({
              icon: faInbox,
              fill: '#9ca3af',
              classes: 'w-6'
            })}

            <p class="text-xl text-gray-700" .opacity-75=${$isPrivate}>${l('album.create.allowSubmissions')}</p>
          </div>

          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked=${$allowSubmissions} disabled=${$isPrivate} class="sr-only peer" />
            <div
              class="relative w-11 h-6 bg-gray-300 outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        <div class="flex flex-col self-stretch gap-3 bg-gray-200 rounded-lg p-3">
          <div class="flex items-center gap-3">
            ${Icon({
              icon: faUsers,
              fill: '#9ca3af',
              classes: 'w-6'
            })}

            <p class="text-xl text-gray-700">${l('album.create.users')}</p>
          </div>

          <div class="flex gap-3 flex-wrap flex-row">
            ${ProfileIcon({
              userId: () => authService.user?.id ?? null,
              classes: 'w-8'
            })}

            <each ${$users}>
              ${(user: Friend) => html`
                <div class="cursor-pointer" @click=${() => removeUser(user)}>
                  ${ProfileIcon({
                    userId: () => user.id,
                    classes: 'w-8'
                  })}
                </div>
              `}
            </each>

            <div
              class="w-8 h-8 bg-white rounded-full grid place-items-center cursor-pointer"
              @click=${() => $openUserSelect()}>
              ${Icon({
                icon: faPlus,
                fill: '#9ca3af',
                classes: 'w-5'
              })}
            </div>
          </div>
        </div>

        <div
          class="cursor-pointer bg-blue-500 rounded-lg text-xl text-white py-2 font-bold w-1/2 text-center"
          .opacity-75=${!$canCreate}
          @click=${createAlbum}>
          ${l('album.create.create')}
        </div>
      </div>
    </div>
  `;
});

export default AuthenticatedRoute(CreateAlbumPageComponent);
