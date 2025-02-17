import { faImages, faInbox, faLock, faPlus, faUnlock } from '@fortawesome/free-solid-svg-icons';
import { Component, useChildComponents, useCleanup, useState } from '@lib/component';
import { ProfileIconComponent } from '../ProfileIcon/ProfileIcon';
import { APIServiceManager } from '../../service/APIService';
import { B2ServiceManager } from '../../service/B2Service';
import { resizeAndCropImage } from '../../logic/image';
import { StateNode, ValueNode } from '@lib/reactivity';
import { requests } from '../../api/requests';
import { AlbumType } from '@api/dto/album';
import { useService } from '@lib/service';
import { IconComponent } from '../Icon';
import { html, UINode } from '@lib/ui';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';

const AlbumCoverUploadComponent = Component(
  ({
    upload,
    isPrivate,
    allowSubmissions
  }: {
    upload: StateNode<(albumId: string) => Promise<boolean>>;
    isPrivate: ValueNode<boolean>;
    allowSubmissions: ValueNode<boolean>;
  }): UINode => {
    const [Icon] = useChildComponents(IconComponent);

    const apiService = useService(APIServiceManager);
    const b2Service = useService(B2ServiceManager);

    const coverSrc = useState<string | null>(null);
    const coverBlob = useState<Blob | null>(null);

    const changeCover = async () => {
      const fileSelect = document.createElement('input');
      fileSelect.type = 'file';
      fileSelect.accept = 'image/*';

      fileSelect.click();

      fileSelect.onchange = () => {
        const file = fileSelect.files?.[0];
        if (file == null) return;

        const fileReader = new FileReader();

        fileReader.onload = () => {
          if (typeof fileReader.result !== 'string') return;

          const originalImage = document.createElement('img');
          originalImage.src = fileReader.result;

          originalImage.onload = async () => {
            const newCoverBlob = await resizeAndCropImage(originalImage, '#e5e7eb', {
              width: 256,
              height: 256
            });
            if (newCoverBlob == null) return;

            $coverBlob = newCoverBlob;

            URL.revokeObjectURL($coverSrc ?? '');
            $coverSrc = URL.createObjectURL(newCoverBlob);
          };
        };

        fileReader.readAsDataURL(file);
      };
    };

    $upload = async albumId => {
      if ($coverBlob == null) return false;

      const response = await apiService.send(requests.album.uploadAlbumCover, { albumId, fileSize: $coverBlob!.size });
      if (response.error || response.result == null) return false;

      const { coverUploadUrl } = response.result;
      return await b2Service.upload(coverUploadUrl, $coverBlob!);
    };

    useCleanup(() => URL.revokeObjectURL($coverSrc ?? ''));

    return html`
      <div
        class="relative w-60 h-60 rounded-lg grid place-items-center shadow-md cursor-pointer bg-gray-200"
        @click=${changeCover}>
        <!-- Album Type -->
        <div class="absolute w-12 h-12 -top-1 -left-1 bg-white rounded-br-xl"></div>

        ${Icon({
          icon: () => ($isPrivate ? faLock : faUnlock),
          fill: () => ($isPrivate ? '#3b82f6' : '#9ca3af'),
          classes: 'absolute w-8 h-8 top-[2px] left-[3px] z-50'
        })}

        <!-- Does Allow Submissions -->
        <div
          class=${`absolute w-12 h-12 -top-1 -right-1 bg-white rounded-bl-xl ${
            $allowSubmissions ? '' : 'hidden'
          }`}></div>

        ${Icon({
          icon: faInbox,
          fill: '#9ca3af',
          classes: () => `absolute w-8 h-8 top-[3px] right-[2px] z-50 ${$allowSubmissions ? '' : 'hidden'}`
        })}

        <if ${$coverSrc == null}>
          ${Icon({
            icon: faImages,
            fill: '#9ca3af',
            classes: 'w-[120px]'
          })}
        </if>
        <else>
          <img src=${$coverSrc} class="w-full h-full object-cover bg-gray-200 rounded-lg" />
        </else>
      </div>
    `;
  }
);

export { AlbumCoverUploadComponent };
