import { BackButtonComponent } from '../../../components/buttons/BackButton';
import { useLocalization } from '../../../service/LocalizationService';
import { Component, useChildComponents } from '@lib/component';
import { HeaderComponent } from '../../../components/Header';
import { useAlbum } from '../../../context/AlbumContext';
import { useRoute, useTitle } from '@lib/router';
import { html, UINode } from '@lib/ui';

const AlbumImagesPageComponent = Component((): UINode => {
  const l = useLocalization();
  const route = useRoute();

  const album = useAlbum();

  return html`
    <div class="flex-grow flex flex-col py-3 px-4 gap-3 w-full max-w-[530px]">
      <p class="text-gray-400 text-center text-lg">Image - ${$route.params.albumId}</p>
    </div>
  `;
});

export default AlbumImagesPageComponent;
