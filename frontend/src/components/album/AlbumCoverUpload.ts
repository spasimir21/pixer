import { Component, useChildComponents, useCleanup, useState } from '@lib/component';
import { APIServiceManager } from '../../service/APIService';
import { B2ServiceManager } from '../../service/B2Service';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { resizeAndCropImage } from '../../logic/image';
import { StateNode } from '@lib/reactivity';
import { useService } from '@lib/service';
import { IconComponent } from '../Icon';
import { html, UINode } from '@lib/ui';
import { requests } from '../../api/requests';

const AlbumCoverUploadComponent = Component(
  ({ upload }: { upload: StateNode<(albumId: string) => Promise<boolean>> }): UINode => {
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
            const newCoverBlob = await resizeAndCropImage(originalImage, 'rgb(209 213 219)', {
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
        class=${`w-60 h-60 rounded-lg ${
          $coverSrc == null ? 'border-2' : ''
        } border-gray-400 grid place-items-center shadow-md cursor-pointer`}
        @click=${changeCover}>
        <if ${$coverSrc == null}>
          ${Icon({
            icon: faPlus,
            fill: 'rgb(209 213 219)',
            classes: 'w-28'
          })}
        </if>
        <else>
          <img src=${$coverSrc} class="w-full h-full object-cover bg-gray-300 rounded-lg" />
        </else>
      </div>
    `;
  }
);

export { AlbumCoverUploadComponent };
