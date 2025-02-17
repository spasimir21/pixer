import { AuthenticationServiceManager } from '../../../service/AuthenticationService';
import { OutletComponent, useNavigation, useRoute, useTitle } from '@lib/router';
import { AuthenticatedRoute } from '../../../components/AuthenticatedRoute';
import { useLocalization } from '../../../service/LocalizationService';
import { APIServiceManager } from '../../../service/APIService';
import { Component, useChildComponents } from '@lib/component';
import { provideAlbum } from '../../../context/AlbumContext';
import LoadingPageComponent from '../../LoadingPage';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { requests } from '../../../api/requests';
import { HeaderComponent } from '../../../components/Header';
import { BackButtonComponent } from '../../../components/buttons/BackButton';
import { AlbumInfoButtonComponent } from '../../../components/buttons/AlbumInfoButton';

const ViewAlbumPageComponent = Component((): UINode => {
  const [Outlet, Header, BackButton, AlbumInfoButton] = useChildComponents(
    OutletComponent,
    HeaderComponent,
    BackButtonComponent,
    AlbumInfoButtonComponent
  );

  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();
  const route = useRoute();

  const album = provideAlbum(() => null);

  useTitle(() => `${l('pixer.title')} - ${$album?.name ?? 'Album'}`);

  apiService.send(requests.album.getAlbumInfo, { albumId: $route.params.albumId }).then(response => {
    if (response.error || response.result == null) {
      navigate({ route: 'home' });
      return;
    }

    $album = response.result;
  });

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: BackButton,
        title: () => $album?.name ?? 'Album',
        right: () => html` <if ${$route.name.endsWith('.images')}> ${AlbumInfoButton()} </if> `
      })}

      <if ${$album == null}>
        <p class="text-gray-400 text-center text-lg pt-4">${l('loading')}</p>
      </if>
      <else> ${Outlet(() => html`<p class="text-gray-400 text-center text-lg pt-4">${l('loading')}</p>`)} </else>
    </div>
  `;
});

export default AuthenticatedRoute(ViewAlbumPageComponent);
