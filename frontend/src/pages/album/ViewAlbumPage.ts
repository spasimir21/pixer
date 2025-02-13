import { BackButtonComponent } from '../../components/buttons/BackButton';
import { useLocalization } from '../../service/LocalizationService';
import { Component, useChildComponents } from '@lib/component';
import { HeaderComponent } from '../../components/Header';
import { useRoute, useTitle } from '@lib/router';
import { html, UINode } from '@lib/ui';

const ViewAlbumPageComponent = Component((): UINode => {
  const [Header, BackButton] = useChildComponents(HeaderComponent, BackButtonComponent);

  const l = useLocalization();
  const route = useRoute();

  useTitle(() => `${l('pixer.title')}`);

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: BackButton,
        title: () => l('pixer.title')
      })}

      <div class="flex-grow flex flex-col py-3 px-4 gap-3 w-full max-w-[530px]">
        <p class="text-gray-400 text-center text-lg">${$route.params.albumId}</p>
      </div>
    </div>
  `;
});

export default ViewAlbumPageComponent;
