import { SelectedImage } from './ImageSelect';
import { StateNode, ValueNode } from '@lib/reactivity';
import { Component, useChildComponents, useCleanup, useInterval, useState } from '@lib/component';
import { html, UINode } from '@lib/ui';
import { IconComponent } from '../Icon';
import { faArrowUpFromBracket, faImages, faUpload } from '@fortawesome/free-solid-svg-icons';
import { useService } from '@lib/service';
import { APIServiceManager } from '../../service/APIService';
import { useLocalization } from '../../service/LocalizationService';
import { B2ServiceManager } from '../../service/B2Service';
import { requests } from '../../api/requests';
import { resizeAndCropImage } from '../../logic/image';
import { Submission } from '@api/dto/submission';
import { Image, ImageKey } from '@api/dto/image';
import {
  aesEncrypt,
  exportAESKey,
  generateAESIv,
  generateAESKey,
  rsaEncrypt,
  UserPublicKeys
} from '../../logic/crypto';

type UserPublicKeysWithId = UserPublicKeys & { userId: Uint8Array };

const ImageUploadComponent = Component(
  ({
    userPublicKeys,
    uploadImages,
    onImageUploaded
  }: {
    userPublicKeys: ValueNode<UserPublicKeysWithId[]>;
    uploadImages: StateNode<(images: SelectedImage[], albumId: string, encrypt: boolean) => Promise<void>>;
    onImageUploaded: (image: Image) => void;
  }): UINode => {
    const [Icon] = useChildComponents(IconComponent);

    const apiService = useService(APIServiceManager);
    const b2Service = useService(B2ServiceManager);
    const l = useLocalization();

    const currentImageCount = useState(0);
    const currentImageIndex = useState(0);
    const isUploading = useState(false);
    const dotLength = useState(0);

    useInterval(() => ($dotLength = ($dotLength + 1) % 3), 300);

    const uploadImage = async (selectedImage: SelectedImage, albumId: string, encrypt: boolean) => {
      const imgElement = document.createElement('img');
      imgElement.src = selectedImage.src;

      try {
        await new Promise((resolve, reject) => {
          imgElement.onload = resolve;
          imgElement.onerror = reject;
        });
      } catch {
        URL.revokeObjectURL(selectedImage.src);
        return null;
      }

      let previewBlob = await resizeAndCropImage(imgElement, '#e5e7eb', {
        width: 96,
        height: 96
      });

      let imageBlob = selectedImage.blob;

      URL.revokeObjectURL(selectedImage.src);

      if (previewBlob == null) return null;

      let keys: ImageKey[] | null = null;

      if (encrypt) {
        const aesKey = await generateAESKey();
        const aesIv = generateAESIv();

        const imageData = await imageBlob.arrayBuffer();
        imageBlob = new Blob([await aesEncrypt(aesKey, aesIv, imageData)], { type: selectedImage.imageType });

        const previewData = await previewBlob.arrayBuffer();
        previewBlob = new Blob([await aesEncrypt(aesKey, aesIv, previewData)], { type: 'image/png' });

        keys = [];
        for (const { userId, encryptionKey } of $userPublicKeys)
          keys.push({
            userId,
            encryptedKey: new Uint8Array(await exportAESKey(aesKey, encryptionKey)),
            encryptedIv: new Uint8Array(await rsaEncrypt(encryptionKey, aesIv))
          });
      }

      const response = await apiService.send(requests.image.create, {
        imageDate: selectedImage.modifiedDate,
        imageType: selectedImage.imageType,
        imageExt: selectedImage.imageExtension,
        keys,
        albumId,
        imageSize: imageBlob.size,
        previewSize: previewBlob.size
      });

      if (response.error || response.result == null) return null;

      const { image, uploadUrls } = response.result;

      await b2Service.upload(uploadUrls.previewUploadUrl, previewBlob);
      await b2Service.upload(uploadUrls.imageUploadUrl, imageBlob);

      return image;
    };

    $uploadImages = async (images, albumId, encrypt) => {
      $currentImageCount = images.length;
      $currentImageIndex = 1;
      $isUploading = true;

      for (const image of images) {
        if (!$isUploading) break;

        const uploadedImage = await uploadImage(image, albumId, encrypt);
        if (uploadedImage != null) onImageUploaded(uploadedImage);

        $currentImageIndex++;
      }

      $isUploading = false;
    };

    useCleanup(() => {
      $isUploading = false;
    });

    return html`
      <div
        .hidden=${!$isUploading}
        class="p-5 fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-25 z-50 grid place-items-center">
        <div
          @click:stopPropagation=${() => {}}
          class="bg-white rounded-lg px-5 py-4 w-[80vw] max-w-[350px] flex flex-col gap-4">
            <p class="text-xl font-bold">${l('album.view.images.upload.title')}</p>

            <div class="flex items-center gap-4">
              ${Icon({
                icon: faImages,
                fill: '#3b82f6',
                classes: 'w-7'
              })}

              <p class="text-lg">
                ${l('album.view.images.upload.uploading')}
                <span class="font-bold">${$currentImageIndex}/${$currentImageCount}</span>${'.'.repeat($dotLength + 1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
);

export { ImageUploadComponent, UserPublicKeysWithId };
