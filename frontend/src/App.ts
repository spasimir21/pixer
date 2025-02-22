import { AuthenticationServiceManager } from './service/AuthenticationService';
import { Component, useChildComponents, useState } from '@lib/component';
import { useLanguage } from './service/LocalizationService';
import { OutletComponent, useNavigation, useRouting } from '@lib/router';
import { APIServiceManager } from './service/APIService';
import LoadingPageComponent from './pages/LoadingPage';
import { UserWithEncryptedKeys } from '@api/dto/user';
import { useService } from '@lib/service';
import { requests } from './api/requests';
import { html, UINode } from '@lib/ui';
import { App } from '@capacitor/app';
import { ROUTES } from './routes';

const AppComponent = Component((): UINode => {
  const [Outlet, LoadingPage] = useChildComponents(OutletComponent, LoadingPageComponent);

  useRouting(ROUTES);

  const { navigate } = useNavigation();

  App.addListener('appUrlOpen', event => {
    const url = new URL(event.url);
    navigate(event.url.slice(url.origin.length));
  });

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);

  const isLoadingUser = useState(true);

  authService.getSavedUserId().then(async savedUserId => {
    if (savedUserId == null) {
      $isLoadingUser = false;
      return;
    }

    const { error, result: user } = await apiService.send(requests.user.getUser, {
      userId: savedUserId,
      username: null,
      includeEncryptedKeys: true
    });

    if (!error && user) authService.logIn(user as UserWithEncryptedKeys);
    else authService.logOut();

    $isLoadingUser = false;
  });

  return html`
    <if ${$isLoadingUser}> ${LoadingPage()} </if>
    <else> ${Outlet(LoadingPage)} </else>
  `;
});

export { AppComponent };
