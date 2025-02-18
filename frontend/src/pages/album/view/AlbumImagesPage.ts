import { BackButtonComponent } from '../../../components/buttons/BackButton';
import { useLocalization } from '../../../service/LocalizationService';
import { Component, useChildComponents, useComputed, useState } from '@lib/component';
import { HeaderComponent } from '../../../components/Header';
import { useAlbum } from '../../../context/AlbumContext';
import { useNavigation, useRoute, useTitle } from '@lib/router';
import { html, UINode } from '@lib/ui';
import { IconComponent } from '../../../components/Icon';
import { faArrowUpFromBracket, faInbox } from '@fortawesome/free-solid-svg-icons';
import { useService } from '@lib/service';
import { AuthenticationServiceManager } from '../../../service/AuthenticationService';
import { toHex } from '@lib/utils/hex';
import { ImageSelectComponent } from '../../../components/image/ImageSelect';

const AlbumImagesPageComponent = Component((): UINode => {
  const [Icon, ImageSelect] = useChildComponents(IconComponent, ImageSelectComponent);

  const authService = useService(AuthenticationServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();
  const route = useRoute();

  const album = useAlbum();

  const isCollaborator = useComputed(() => {
    if (authService.user == null || $album == null) return false;
    const userId = toHex(authService.user.id);
    return toHex($album!.creator.id) === userId || $album!.users.map(({ id }) => toHex(id)).includes(userId);
  });

  const openImageSelect = useState(() => {});

  return html`
    ${ImageSelect({
      open: openImageSelect,
      onImagesSelected: console.log,
      maxImages: 10
    })}

    <div class="flex-grow flex flex-col py-3 px-4 gap-3 w-full max-w-[530px]">
      <p class="text-gray-400 text-center text-lg">Image - ${$route.params.albumId}</p>

      <div class="fixed bottom-4 right-4 flex gap-2">
        <if ${$album?.allowSubmissions}>
          <div
            class="w-12 h-12 rounded-full bg-white grid place-items-center border-2 border-gray-400 shadow-xl cursor-pointer"
            @click=${() => navigate({ route: 'album.view.submissions', params: $route.params })}>
            ${Icon({
              icon: faInbox,
              fill: '#3b82f6',
              classes: 'w-7'
            })}
          </div>
        </if>

        <if ${$isCollaborator}>
          <div
            class="w-12 h-12 rounded-full bg-white grid place-items-center border-2 border-gray-400 shadow-xl cursor-pointer"
            @click=${() => $openImageSelect()}>
            ${Icon({
              icon: faArrowUpFromBracket,
              fill: '#3b82f6',
              classes: 'h-7'
            })}
          </div>
        </if>
      </div>
    </div>
  `;
});

export default AlbumImagesPageComponent;
