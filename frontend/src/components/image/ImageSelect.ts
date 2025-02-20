import { Component, useChildComponents, useCleanup, useState } from '@lib/component';
import { StateNode } from '@lib/reactivity';
import { html, UINode } from '@lib/ui';
import { useLocalization } from '../../service/LocalizationService';
import { IconComponent } from '../Icon';
import { faImages, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

interface SelectedImage {
  modifiedDate: Date;
  blob: Blob;
  src: string;
  imageType: string;
  imageExtension: string;
}

const ImageSelectComponent = Component(
  ({
    open,
    onImagesSelected,
    maxImages
  }: {
    open: StateNode<() => void>;
    onImagesSelected: (images: SelectedImage[]) => void;
    maxImages: number;
  }): UINode => {
    const [Icon] = useChildComponents(IconComponent);

    const l = useLocalization();

    const images = useState([] as SelectedImage[]);
    const isOpen = useState(false);

    $open = () => {
      $isOpen = true;

      for (const image of $images) URL.revokeObjectURL(image.src);

      $images = [];
    };

    const selectImage = () => {
      const fileSelect = document.createElement('input');
      fileSelect.type = 'file';
      fileSelect.accept = 'image/*';
      fileSelect.multiple = true;

      fileSelect.click();

      fileSelect.onchange = () => {
        const files = Array.from(fileSelect.files ?? []).slice(0, maxImages - $images.length);

        for (const file of files) {
          const fileReader = new FileReader();

          fileReader.onload = () => {
            if (fileReader.result == null || !(fileReader.result instanceof ArrayBuffer)) return;

            const blob = new Blob([fileReader.result], { type: file.type });
            const src = URL.createObjectURL(blob);

            $images.push({
              blob,
              src,
              modifiedDate: new Date(file.lastModified),
              imageType: file.type,
              imageExtension: file.name.split('.').pop()!
            });
          };

          fileReader.readAsArrayBuffer(file);
        }
      };
    };

    const removeImage = (image: SelectedImage) => {
      $images.splice($images.indexOf(image), 1);
      URL.revokeObjectURL(image.src);
    };

    useCleanup(() => {
      for (const image of $images) URL.revokeObjectURL(image.src);
    });

    return html`
      <div
        @click=${() => ($isOpen = false)}
        .hidden=${!$isOpen}
        class="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-25 z-50 flex items-end justify-center">
        <div
          @click:stopPropagation=${() => {}}
          class="bg-white w-screen max-w-[500px] rounded-t-2xl flex flex-col p-4 gap-4">
          <p class="font-bold text-2xl">${l('album.view.images.select.title')}</p>

          <div class="flex flex-row flex-wrap gap-4">
            <each ${$images}>
              ${(image: SelectedImage) => html`
                <div class="relative w-28 h-28">
                  <div
                    @click=${() => removeImage(image)}
                    class="cursor-pointer grid place-items-center absolute -top-2 -right-2 rounded-full w-6 h-6 bg-red-500">
                    ${Icon({
                      icon: faXmark,
                      fill: 'white',
                      classes: 'w-3'
                    })}
                  </div>

                  <img src=${image.src} class="bg-gray-200 w-28 h-28 object-contain rounded-lg shadow-md" />
                </div>
              `}
            </each>

            <if ${$images.length < maxImages}>
              <div
                @click=${selectImage}
                class="cursor-pointer w-28 h-28 bg-gray-200 rounded-lg shadow-md grid place-items-center">
                ${Icon({
                  icon: faPlus,
                  fill: '#9ca3af',
                  classes: 'w-12'
                })}
              </div>
            </if>
          </div>

          <div
            class="cursor-pointer self-end bg-blue-500 rounded-lg text-xl text-white py-2 px-6 font-bold flex items-center gap-4 justify-center"
            .opacity-75=${$images.length === 0}
            @click=${() => $images.length > 0 && (onImagesSelected([...$images]), ($isOpen = false))}>
            ${Icon({
              icon: faImages,
              fill: 'white',
              classes: 'w-6'
            })}
            ${l('album.view.images.select.select')} (${$images.length})
          </div>
        </div>
      </div>
    `;
  }
);

export { ImageSelectComponent, SelectedImage };
