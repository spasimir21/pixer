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
import { PinAlbumButtonComponent } from '../../../components/buttons/PinAlbumButton';
import { AlbumType } from '@api/dto/album';
import { toHex } from '@lib/utils/hex';
import { EditAlbumButtonComponent } from '../../../components/buttons/EditAlbumButton';
import { DeleteAlbumButtonComponent } from '../../../components/buttons/DeleteAlbumButton';

const ViewAlbumPageComponent = Component((): UINode => {
  const [Outlet, Header, BackButton, AlbumInfoButton, PinAlbumButton, EditAlbumButton, DeleteAlbumButton] =
    useChildComponents(
      OutletComponent,
      HeaderComponent,
      BackButtonComponent,
      AlbumInfoButtonComponent,
      PinAlbumButtonComponent,
      EditAlbumButtonComponent,
      DeleteAlbumButtonComponent
    );

  const authService = useService(AuthenticationServiceManager);
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

  const rightButton = () => html`
    <if ${$route.name.endsWith('.images')}> ${AlbumInfoButton()} </if>
    <else-if ${$route.name.endsWith('.info') && toHex($album!.creatorId) === toHex(authService.user!.id)}>
      ${EditAlbumButton()}
    </else-if>
    <else-if
      ${$route.name.endsWith('.info') &&
      $album!.type === AlbumType.PUBLIC &&
      !$album!.users.some(id => toHex(id) === toHex(authService.user!.id))}>
      ${PinAlbumButton()}
    </else-if>
    <else-if ${$route.name.endsWith('edit')}> ${DeleteAlbumButton()} </else-if>
  `;

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: BackButton,
        title: () => $album?.name ?? 'Album',
        right: rightButton
      })}

      <if ${$album == null}>
        <p class="text-gray-400 text-center text-lg pt-4">${l('loading')}</p>
      </if>
      <else> ${Outlet(() => html`<p class="text-gray-400 text-center text-lg pt-4">${l('loading')}</p>`)} </else>
    </div>
  `;
});

export default AuthenticatedRoute(ViewAlbumPageComponent);
