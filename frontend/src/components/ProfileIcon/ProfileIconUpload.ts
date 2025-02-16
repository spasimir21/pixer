import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { Component, useCleanup, useEffect, useState } from '@lib/component';
import { APIServiceManager } from '../../service/APIService';
import { B2ServiceManager } from '../../service/B2Service';
import { resizeAndCropImage } from '../../logic/image';
import { requests } from '../../api/requests';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { toHex } from '@lib/utils/hex';

const ProfileIconUploadComponent = Component((): UINode => {
  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const b2Service = useService(B2ServiceManager);

  const profileIconSrc = useState<string | null>(null);
  const isLoading = useState(false);

  useEffect(() => {
    if (authService.user?.id == null) {
      $profileIconSrc = '/assets/blank.png';
      return;
    }

    const hexId = toHex(authService.user.id);

    const image = document.createElement('img');
    image.src = b2Service.profileIcon(hexId, true);

    image.onload = () => ($profileIconSrc = image.src);
    image.onerror = () => ($profileIconSrc = '/assets/profile.png');
  });

  const changeProfileIcon = async () => {
    if ($isLoading) return;

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
          const fullBlob = await resizeAndCropImage(originalImage, '#d1d5db', { width: 200, height: 200 });
          if (fullBlob == null) return;

          const smallBlob = await resizeAndCropImage(originalImage, '#d1d5db', { width: 36, height: 36 });
          if (smallBlob == null) return;

          const prevProfileIconSrc = $profileIconSrc;
          $profileIconSrc = URL.createObjectURL(fullBlob);

          $isLoading = true;

          const uploadResponse = await apiService.send(requests.user.uploadProfileIcon, {
            fullFileSize: fullBlob.size,
            smallFileSize: smallBlob.size
          });

          let didSucceed = false;
          if (uploadResponse.error == null && uploadResponse.result != null)
            didSucceed =
              (await b2Service.upload(uploadResponse.result.fullUploadUrl, fullBlob)) &&
              (await b2Service.upload(uploadResponse.result.smallUploadUrl, smallBlob));

          if (didSucceed) {
            URL.revokeObjectURL(prevProfileIconSrc ?? '');
            b2Service.invalidateProfileIcons();
          } else $profileIconSrc = prevProfileIconSrc;

          $isLoading = false;
        };
      };

      fileReader.readAsDataURL(file);
    };
  };

  useCleanup(() => URL.revokeObjectURL($profileIconSrc ?? ''));

  return html`
    <img
      src=${$profileIconSrc ?? '/assets/blank.png'}
      class="w-1/2 max-w-48 aspect-square rounded-full object-cover bg-gray-300"
      .cursor-pointer=${!$isLoading}
      .brightness-75=${$isLoading}
      @click=${changeProfileIcon} />
  `;
});

export { ProfileIconUploadComponent };
