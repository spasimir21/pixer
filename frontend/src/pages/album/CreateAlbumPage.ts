import { HomeButtonComponent } from '../../components/buttons/HomeButton';
import { AuthenticatedRoute } from '../../components/AuthenticatedRoute';
import { useLocalization } from '../../service/LocalizationService';
import { Component, useChildComponents } from '@lib/component';
import { HeaderComponent } from '../../components/Header';
import { html, UINode } from '@lib/ui';
import { useTitle } from '@lib/router';

const CreateAlbumPageComponent = Component((): UINode => {
  const [Header, HomeButton] = useChildComponents(HeaderComponent, HomeButtonComponent);

  const l = useLocalization();

  useTitle(() => `${l('pixer.title')} - ${l('album.create.title')}`);

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: HomeButton,
        title: () => l('album.create.title')
      })}

      <div class="flex-grow flex flex-col w-full max-w-[430px]"></div>
    </div>
  `;
});

export default AuthenticatedRoute(CreateAlbumPageComponent);
