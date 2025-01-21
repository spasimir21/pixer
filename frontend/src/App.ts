import { AuthenticationServiceManager } from './service/AuthenticationService';
import { Component, useChildComponents, useState } from '@lib/component';
import { clearSavedUserId, getSavedUserId } from './logic/storage';
import { OutletComponent, useRouting } from '@lib/router';
import { APIServiceManager } from './service/APIService';
import LoadingPageComponent from './pages/LoadingPage';
import { UserWithEncryptedKeys } from '@api/dto/user';
import { useService } from '@lib/service';
import { requests } from './api/requests';
import { html, UINode } from '@lib/ui';
import { ROUTES } from './routes';

const AppComponent = Component((): UINode => {
  const [Outlet, LoadingPage] = useChildComponents(OutletComponent, LoadingPageComponent);

  useRouting(ROUTES);

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);

  const savedUserId = getSavedUserId();

  const isLoadingUser = useState(savedUserId != null);

  if (savedUserId != null)
    apiService
      .send(requests.user.get, {
        userId: savedUserId,
        username: null,
        includeEncryptedKeys: true
      })
      .then(({ error, result: user }) => {
        $isLoadingUser = false;

        if (!error && user) authService.logIn(user as UserWithEncryptedKeys);
        else clearSavedUserId();
      });

  return html`
    <if ${$isLoadingUser}> ${LoadingPage()} </if>
    <else> ${Outlet(LoadingPageComponent)} </else>
  `;
});

export { AppComponent };
