import { AuthenticationServiceManager } from '../service/AuthenticationService';
import { ProfileButtonComponent } from '../components/buttons/ProfileButton';
import { Component, useChildComponents, useState } from '@lib/component';
import { AuthenticatedRoute } from '../components/AuthenticatedRoute';
import { AlbumInfoComponent } from '../components/album/AlbumInfo';
import { useLocalization } from '../service/LocalizationService';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { APIServiceManager } from '../service/APIService';
import { HeaderComponent } from '../components/Header';
import { useNavigation, useTitle } from '@lib/router';
import { IconComponent } from '../components/Icon';
import { requests } from '../api/requests';
import { AlbumInfo } from '@api/dto/album';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { CreateAlbumButtonComponent } from '../components/buttons/CreateAlbumButton';

const HomePageComponent = Component((): UINode => {
  const [Header, CreateAlbumButton, ProfileButton, Icon, AlbumInfo] = useChildComponents(
    HeaderComponent,
    CreateAlbumButtonComponent,
    ProfileButtonComponent,
    IconComponent,
    AlbumInfoComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();

  useTitle(() => `${l('pixer.title')} (${authService.user?.username})`);

  const isLoading = useState(true);

  const albums = useState({
    own: [] as AlbumInfo[],
    shared: [] as AlbumInfo[],
    pinned: [] as AlbumInfo[]
  });

  apiService.send(requests.album.getAccessibleAlbumsInfo, { includeUsers: false }).then(response => {
    if (response.error) {
      authService.logOut();
      navigate({ route: 'auth.login' }, true);

      return;
    }

    $albums = response.result;
    $isLoading = false;
  });

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: CreateAlbumButton,
        title: () => l('pixer.title'),
        right: ProfileButton
      })}

      <div class="flex-grow flex flex-col py-3 px-4 gap-3 w-full">
        <if ${$isLoading}>
          <p class="text-center text-gray-400 text-lg mt-4">${l('loading')}</p>
        </if>
        <else-if ${$albums.own.length + $albums.shared.length === 0}>
          <p class="text-gray-400 text-lg text-center mt-2">${l('home.noAlbums')}</p>
        </else-if>
        <else>
          <if ${$albums.own.length > 0}>
            <p class="text-gray-700 text-lg border-b-2 border-gray-300 w-fit">${l('home.yourAlbums')}</p>

            <div class="flex flex-row flex-wrap gap-4 mb-4">
              <each ${$albums.own}> ${(album: AlbumInfo) => AlbumInfo({ album })} </each>
            </div>
          </if>

          <if ${$albums.shared.length > 0}>
            <p class="text-gray-700 text-lg border-b-2 border-gray-300 w-fit">${l('home.sharedAlbums')}</p>

            <div class="flex flex-row flex-wrap gap-4">
              <each ${$albums.shared}> ${(album: AlbumInfo) => AlbumInfo({ album })} </each>
            </div>
          </if>

          <if ${$albums.pinned.length > 0}>
            <p class="text-gray-700 text-lg border-b-2 border-gray-300 w-fit">${l('home.pinnedAlbums')}</p>

            <div class="flex flex-row flex-wrap gap-4">
              <each ${$albums.pinned}> ${(album: AlbumInfo) => AlbumInfo({ album })} </each>
            </div>
          </if>
        </else>
      </div>
    </div>
  `;
});

export default AuthenticatedRoute(HomePageComponent);
