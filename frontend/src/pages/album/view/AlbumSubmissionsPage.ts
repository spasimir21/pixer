import { BackButtonComponent } from '../../../components/buttons/BackButton';
import { useLocalization } from '../../../service/LocalizationService';
import { Component, useChildComponents, useComputed, useEffect } from '@lib/component';
import { HeaderComponent } from '../../../components/Header';
import { useAlbum } from '../../../context/AlbumContext';
import { useNavigation, useRoute, useTitle } from '@lib/router';
import { html, UINode } from '@lib/ui';
import { IconComponent } from '../../../components/Icon';
import { faArrowUpFromBracket, faInbox } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationServiceManager } from '../../../service/AuthenticationService';
import { useService } from '@lib/service';
import { toHex } from '@lib/utils/hex';

const AlbumSubmissionsPageComponent = Component((): UINode => {
  const [Icon] = useChildComponents(IconComponent);

  const authService = useService(AuthenticationServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();
  const route = useRoute();

  const album = useAlbum();

  const isJudge = useComputed(() => {
    if (authService.user == null || $album == null) return false;
    const userId = toHex(authService.user.id);
    return toHex($album!.creator.id) === userId || $album!.users.map(({ id }) => toHex(id)).includes(userId);
  });

  useEffect(() => {
    if ($album?.allowSubmissions !== true) navigate({ route: 'album.view.images', params: $route.params }, true);
  });

  return html`
    <div class="flex-grow flex flex-col py-3 px-4 gap-3 w-full max-w-[530px]">
      <p class="text-gray-400 text-center text-lg">Submissions - ${$album?.name}</p>

      <div class="fixed bottom-4 right-4 flex gap-2">
        <if ${!$isJudge}>
          <div
            class="w-12 h-12 rounded-full bg-white grid place-items-center border-2 border-gray-400 shadow-xl cursor-pointer">
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

export default AlbumSubmissionsPageComponent;
