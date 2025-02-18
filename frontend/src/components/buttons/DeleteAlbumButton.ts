import { faArrowLeft, faPen, faPlus, faPlusCircle, faPlusSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Component, useChildComponents, useState } from '@lib/component';
import { APIServiceManager } from '../../service/APIService';
import { useNavigation, useRoute } from '@lib/router';
import { useService } from '@lib/service';
import { IconComponent } from '../Icon';
import { html, UINode } from '@lib/ui';
import { useAlbum } from '../../context/AlbumContext';
import { requests } from '../../api/requests';
import { useLocalization } from '../../service/LocalizationService';

const DeleteAlbumButtonComponent = Component((): UINode => {
  const [Icon] = useChildComponents(IconComponent);

  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();

  const album = useAlbum();

  const isLoading = useState(false);
  const isOpen = useState(false);

  const _delete = async () => {
    if ($isLoading || $album == null) return;
    $isLoading = true;

    await apiService.send(requests.album.delete, { id: $album!.id });

    navigate({ route: 'home' });
  };

  return html`
    <div
      @click=${() => ($isOpen = false)}
      .hidden=${!$isOpen}
      class="p-5 fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-25 z-50 grid place-items-center">
      <div
        class="bg-white rounded-lg p-4 w-[80vw] max-w-[350px] flex flex-col gap-6"
        @click:stopPropagation=${() => {}}>
        <p class="text-xl">${l('album.view.edit.delete.delete')} <span class="font-bold">"${$album?.name}"</span>?</p>

        <div class="flex gap-4">
          <div
            class="cursor-pointer bg-red-500 rounded-lg text-lg text-white py-1 px-4 font-bold text-center"
            .opacity-75=${$isLoading}
            @click=${_delete}>
            ${l('album.view.edit.delete.delete')}
          </div>

          <div
            @click=${() => ($isOpen = false)}
            class="cursor-pointer bg-gray-400 rounded-lg text-lg text-white py-1 px-4 font-bold text-center">
            ${l('album.view.edit.delete.cancel')}
          </div>
        </div>
      </div>
    </div>

    <div class="w-9 h-9 grid place-items-center cursor-pointer" @click=${() => ($isOpen = true)}>
      ${Icon({
        icon: faTrash,
        fill: '#374151',
        classes: 'w-6'
      })}
    </div>
  `;
});

export { DeleteAlbumButtonComponent };
