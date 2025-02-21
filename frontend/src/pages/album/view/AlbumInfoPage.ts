import { BackButtonComponent } from '../../../components/buttons/BackButton';
import { useLocalization } from '../../../service/LocalizationService';
import { Component, useChildComponents, useEffect, useState } from '@lib/component';
import { HeaderComponent } from '../../../components/Header';
import { useNavigation, useRoute, useTitle } from '@lib/router';
import { html, UINode } from '@lib/ui';
import { useAlbum } from '../../../context/AlbumContext';
import { IconComponent } from '../../../components/Icon';
import { ProfileIconComponent } from '../../../components/ProfileIcon/ProfileIcon';
import { faImages, faInbox, faLink, faLock, faUnlock, faUsers } from '@fortawesome/free-solid-svg-icons';
import { AlbumType } from '@api/dto/album';
import { useService } from '@lib/service';
import { B2ServiceManager } from '../../../service/B2Service';

const AlbumInfoPageComponent = Component((): UINode => {
  const [Icon, ProfileIcon] = useChildComponents(IconComponent, ProfileIconComponent);

  const l = useLocalization();

  const album = useAlbum();

  const b2Service = useService(B2ServiceManager);
  const { navigate } = useNavigation();

  const coverSrc = useState<string | null>(null);
  const hasCover = useState(true);

  useEffect(() => {
    const image = document.createElement('img');
    image.src = b2Service.albumCover($album?.id ?? '');

    image.onload = () => ($coverSrc = image.src);
    image.onerror = () => ($hasCover = false);
  });

  return html`
    <div class="flex-grow flex flex-col w-full max-w-72 items-center pt-6 gap-6">
      <div class="bg-gray-200 rounded-lg w-60 h-60 relative grid place-items-center ">
        <!-- Album Type -->
        <div class="absolute w-12 h-12 -top-1 -left-1 bg-white rounded-br-xl"></div>

        ${Icon({
          icon: () => ($album?.type === AlbumType.PUBLIC ? faUnlock : faLock),
          fill: () => ($album?.type === AlbumType.PUBLIC ? '#9ca3af' : '#3b82f6'),
          classes: 'absolute w-8 h-8 top-[2px] left-[3px] z-50'
        })}

        <!-- Does Allow Submissions -->
        <div
          class=${`absolute w-12 h-12 -top-1 -right-1 bg-white rounded-bl-xl ${
            $album?.allowSubmissions ? '' : 'hidden'
          }`}></div>

        ${Icon({
          icon: faInbox,
          fill: '#9ca3af',
          classes: () => `absolute w-8 h-8 top-[3px] right-[2px] z-50 ${$album?.allowSubmissions ? '' : 'hidden'}`
        })}

        <!-- Album Creator -->
        ${ProfileIcon({
          userId: () => $album?.creator?.id ?? null,
          classes: 'absolute w-16 h-16 -bottom-2 -right-2 border-white border-8'
        })}

        <img src=${$coverSrc} class=${`rounded-lg w-60 h-60 object-cover ${$hasCover && $coverSrc ? '' : 'hidden'}`} />

        ${Icon({
          icon: faImages,
          fill: '#9ca3af',
          classes: () => `w-[120px] h-[120px] ${$hasCover ? 'hidden' : ''}`
        })}
      </div>

      <div class="flex items-center justify-between self-stretch">
        <div class="flex items-center gap-3">
          ${Icon({
            icon: faUnlock,
            fill: '#9ca3af',
            classes: 'w-4'
          })}

          <p class="text-xl text-gray-700">${l('album.create.public')}</p>
        </div>

        <label class="inline-flex items-center ">
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

          <p class="text-xl text-gray-700">${l('album.view.info.allowsSubmissions')}</p>
        </div>

        <label class="inline-flex items-center ">
          <input type="checkbox" checked=${$album?.allowSubmissions} disabled class="sr-only peer" />
          <div
            class="opacity-75 relative w-11 h-6 bg-gray-300 outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
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
          <div @click=${() => navigate({ route: 'user', params: { username: $album?.creator?.username ?? '' } })}>
            ${ProfileIcon({
              userId: () => $album?.creator?.id ?? null,
              classes: 'w-8 cursor-pointer'
            })}
          </div>

          <each ${$album?.users ?? []}>
            ${(user: { id: Uint8Array; username: string }) => html`
              <div @click=${() => navigate({ route: 'user', params: { username: user.username } })}>
                ${ProfileIcon({
                  userId: () => user.id,
                  classes: 'w-8 cursor-pointer'
                })}
              </div>
            `}
          </each>
        </div>
      </div>

      <if ${$album?.type === AlbumType.PUBLIC}>
        <div
          class="py-3 bg-blue-500 rounded-lg w-3/4 cursor-pointer text-white flex items-center gap-3 justify-center font-bold text-xl"
          @click=${() => navigator.clipboard.writeText(`${import.meta.env.VITE_ORIGIN}/album/${$album?.id}`)}>
          ${Icon({ icon: faLink, fill: 'white', classes: 'w-6' })} ${l('album.view.info.share')}
        </div>
      </if>
    </div>
  `;
});

export default AlbumInfoPageComponent;
