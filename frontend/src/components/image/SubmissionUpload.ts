import { SelectedImage } from './ImageSelect';
import { StateNode } from '@lib/reactivity';
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

const SubmissionUploadComponent = Component(
  ({
    uploadSubmissions,
    onSubmissionUploaded
  }: {
    uploadSubmissions: StateNode<(images: SelectedImage[], albumId: string) => Promise<void>>;
    onSubmissionUploaded: (submission: Submission) => void;
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

    const uploadImage = async (image: SelectedImage, albumId: string) => {
      const imgElement = document.createElement('img');
      imgElement.src = image.src;

      try {
        await new Promise((resolve, reject) => {
          imgElement.onload = resolve;
          imgElement.onerror = reject;
        });
      } catch {
        URL.revokeObjectURL(image.src);
        return null;
      }

      const previewBlob = await resizeAndCropImage(imgElement, '#e5e7eb', {
        width: 96,
        height: 96
      });

      URL.revokeObjectURL(image.src);

      if (previewBlob == null) return null;

      const response = await apiService.send(requests.submission.create, {
        imageDate: image.modifiedDate,
        imageType: image.imageType,
        imageExt: image.imageExtension,
        albumId,
        imageSize: image.blob.size,
        previewSize: previewBlob.size
      });

      if (response.error || response.result == null) return null;

      const { submission, uploadUrls } = response.result;

      await b2Service.upload(uploadUrls.previewUploadUrl, previewBlob);
      await b2Service.upload(uploadUrls.imageUploadUrl, image.blob);

      return submission;
    };

    $uploadSubmissions = async (images, albumId) => {
      $currentImageCount = images.length;
      $currentImageIndex = 1;
      $isUploading = true;

      for (const image of images) {
        if (!$isUploading) break;

        const submission = await uploadImage(image, albumId);
        if (submission != null) onSubmissionUploaded(submission);

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
            <p class="text-xl font-bold">${l('album.view.submissions.upload.title')}</p>

            <div class="flex items-center gap-4">
              ${Icon({
                icon: faImages,
                fill: '#3b82f6',
                classes: 'w-7'
              })}

              <p class="text-lg">
                ${l('album.view.submissions.upload.uploading')}
                <span class="font-bold">${$currentImageIndex}/${$currentImageCount}</span>${'.'.repeat($dotLength + 1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
);

export { SubmissionUploadComponent };
