import { Component, useChildComponents, useEffect, useState } from '@lib/component';
import { faImages, faInbox, faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
import { ProfileIconComponent } from '../ProfileIcon/ProfileIcon';
import { B2ServiceManager } from '../../service/B2Service';
import { AlbumInfo, AlbumType } from '@api/dto/album';
import { useService } from '@lib/service';
import { IconComponent } from '../Icon';
import { html, UINode } from '@lib/ui';
import { useNavigation } from '@lib/router';

const AlbumInfoComponent = Component(({ album }: { album: AlbumInfo }): UINode => {
  const [Icon, ProfileIcon] = useChildComponents(IconComponent, ProfileIconComponent);

  const b2Service = useService(B2ServiceManager);
  const { navigate } = useNavigation();

  const coverSrc = useState<string | null>(null);
  const hasCover = useState(true);

  useEffect(() => {
    const image = document.createElement('img');
    image.src = b2Service.albumCover(album.id);

    image.onload = () => ($coverSrc = image.src);
    image.onerror = () => ($hasCover = false);
  });

  return html`
    <div class="w-28 flex flex-col items-center gap-2">
      <div
        class="bg-gray-200 rounded-lg w-28 h-28 relative grid place-items-center cursor-pointer"
        @click=${() => navigate({ route: 'album.view', params: { albumId: album.id } })}>
        <!-- Album Type -->
        <div class="absolute w-7 h-7 -top-1 -left-1 bg-white rounded-br-xl"></div>

        ${Icon({
          icon: album.type === AlbumType.PUBLIC ? faUnlock : faLock,
          fill: album.type === AlbumType.PUBLIC ? '#9ca3af' : '#3b82f6',
          classes: 'absolute w-4 h-4 top-[2px] left-[2px] z-50'
        })}

        <!-- Does Allow Submissions -->
        <div
          class=${`absolute w-7 h-7 -top-1 -right-1 bg-white rounded-bl-xl ${
            album.allowSubmissions ? '' : 'hidden'
          }`}></div>

        ${Icon({
          icon: faInbox,
          fill: '#9ca3af',
          classes: `absolute w-4 h-4 top-[2px] right-[1px] z-50 ${album.allowSubmissions ? '' : 'hidden'}`
        })}

        <!-- Album Creator -->
        ${ProfileIcon({
          userId: () => album.creatorId,
          classes: 'absolute w-8 h-8 -bottom-2 -right-2 border-white border-4'
        })}

        <img src=${$coverSrc} class=${`rounded-lg w-28 h-28 object-cover ${$hasCover && $coverSrc ? '' : 'hidden'}`} />

        ${Icon({
          icon: faImages,
          fill: '#9ca3af',
          classes: `w-14 h-14 ${$hasCover ? 'hidden' : ''}`
        })}
      </div>

      <p class="text-center">${album.name}</p>
    </div>
  `;
});

export { AlbumInfoComponent };
