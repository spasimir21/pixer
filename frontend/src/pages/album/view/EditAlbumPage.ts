import { AuthenticatedRoute } from '../../../components/AuthenticatedRoute';
import { Component, useChildComponents, useComputed, useState } from '@lib/component';
import { html, UINode } from '@lib/ui';
import { UserSelectComponent } from '../../../components/user/UserSelect';
import { ProfileIconComponent } from '../../../components/ProfileIcon/ProfileIcon';
import { IconComponent } from '../../../components/Icon';
import { AlbumCoverUploadComponent } from '../../../components/album/AlbumCoverUpload';
import { useService } from '@lib/service';
import { AuthenticationServiceManager } from '../../../service/AuthenticationService';
import { APIServiceManager } from '../../../service/APIService';
import { NavigateToComponent, useNavigation } from '@lib/router';
import { useLocalization } from '../../../service/LocalizationService';
import { requests } from '../../../api/requests';
import { toHex } from '@lib/utils/hex';
import { AlbumType } from '@api/dto/album';
import { useAlbum } from '../../../context/AlbumContext';
import { toValueNode } from '@lib/reactivity';
import { UserInfo } from '@api/dto/user';
import { faInbox, faLock, faPlus, faUnlock, faUsers } from '@fortawesome/free-solid-svg-icons';

const EditAlbumPageComponent = Component((): UINode => {
  const [AlbumCoverUpload, Icon, ProfileIcon, UserSelect, NavigateTo] = useChildComponents(
    AlbumCoverUploadComponent,
    IconComponent,
    ProfileIconComponent,
    UserSelectComponent,
    NavigateToComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();

  const album = useAlbum();

  if ($album == null || authService.user == null || toHex($album!.creator.id) !== toHex(authService.user!.id))
    return NavigateTo({ route: 'home' }, null, true);

  const name = useState($album?.name ?? '');
  const allowSubmissions = useState($album?.allowSubmissions ?? false);
  const users = useState<UserInfo[]>([]);

  const isLoading = useState(false);

  const canEdit = useComputed(() => !$isLoading && $name.trim().length >= 3);

  const friends = useState<UserInfo[]>([]);

  apiService.send(requests.friend.getFriends, {}).then(response => {
    if (response.error) return;

    const userIds = ($album?.users ?? []).map(({ id }) => toHex(id));

    $users = response.result.filter(friend => userIds.includes(toHex(friend.id)));
    $friends = response.result.filter(friend => !userIds.includes(toHex(friend.id)));
  });

  const removeUser = (user: UserInfo) => {
    $users.splice($users.indexOf(user), 1);
    $friends.push(user);
  };

  const addUser = (user: UserInfo) => {
    $friends.splice($friends.indexOf(user), 1);
    $users.push(user);
  };

  const uploadAlbumCover = useState(async (albumId: string) => false);
  const openUserSelect = useState(() => {});

  const editAlbum = async () => {
    if (!$canEdit || $album == null) return;
    $isLoading = true;

    const response = await apiService.send(requests.album.edit, {
      id: $album!.id,
      name: $name,
      type: $album!.type,
      allowSubmissions: $allowSubmissions,
      users: $users.map(user => user.id)
    });

    if (response.error == null && response.result != null) {
      await $uploadAlbumCover(response.result.id);

      navigate({ route: 'album.view.info', params: { albumId: $album?.id ?? '' } });

      return;
    }

    $isLoading = false;
  };

  return html`
    <!-- Modal -->
    ${UserSelect({
      open: openUserSelect,
      users: friends,
      onUserSelected: addUser
    })}

    <div class="flex-grow flex flex-col w-full max-w-72 items-center pt-6 gap-6">
      ${AlbumCoverUpload({
        albumId: toValueNode(() => $album?.id ?? null),
        upload: uploadAlbumCover,
        isPrivate: toValueNode(() => $album?.type === AlbumType.PRIVATE),
        allowSubmissions
      })}

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
          <input type="checkbox" checked=${$album?.type === AlbumType.PRIVATE} disabled class="sr-only peer" />
          <div
            class="opacity-75 relative w-11 h-6 bg-gray-300 outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
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

          <p class="text-xl text-gray-700" .opacity-75=${$album?.type === AlbumType.PRIVATE}>
            ${l('album.create.allowSubmissions')}
          </p>
        </div>

        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            :checked=${$allowSubmissions}
            disabled=${$album?.type === AlbumType.PRIVATE}
            class="sr-only peer" />
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
            ${(user: UserInfo) => html`
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
        .opacity-75=${!$canEdit}
        @click=${editAlbum}>
        ${l('album.view.edit.save')}
      </div>
    </div>
  `;
});

export default AuthenticatedRoute(EditAlbumPageComponent);
