import { faInfoCircle, faThumbTack, faThumbTackSlash } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { Component, useChildComponents, useState } from '@lib/component';
import { useAlbum } from '../../context/AlbumContext';
import { useService } from '@lib/service';
import { IconComponent } from '../Icon';
import { html, UINode } from '@lib/ui';
import { APIServiceManager } from '../../service/APIService';
import { requests } from '../../api/requests';

const PinAlbumButtonComponent = Component((): UINode => {
  const [Icon] = useChildComponents(IconComponent);

  const apiService = useService(APIServiceManager);

  const album = useAlbum();

  const isLoading = useState(false);

  const onClick = async () => {
    if ($isLoading || $album == null) return;
    $isLoading = true;

    if (!$album!.isPinned) {
      const response = await apiService.send(requests.album.pinAlbum, { albumId: $album!.id });
      if (response.error == null && response.result === true) $album!.isPinned = true;
    } else {
      const response = await apiService.send(requests.album.unpinAlbum, { albumId: $album!.id });
      if (response.error == null && response.result === true) $album!.isPinned = false;
    }

    $isLoading = false;
  };

  return html`
    <div .opacity-75=${$isLoading} class="w-9 h-9 grid place-items-center cursor-pointer" @click=${onClick}>
      ${Icon({
        icon: () => ($album?.isPinned ? faThumbTackSlash : faThumbTack),
        fill: '#374151',
        classes: 'h-6'
      })}
    </div>
  `;
});

export { PinAlbumButtonComponent };
