import { Component, useChildComponents, useComputed, useState } from '@lib/component';
import { NavigateToComponent, useNavigation, useRoute, useTitle } from '@lib/router';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { useLocalization } from '../../service/LocalizationService';
import { APIServiceManager } from '../../service/APIService';
import { UserWithEncryptedKeys } from '@api/dto/user';
import LoadingPageComponent from '../LoadingPage';
import { TranslationKey } from '../../lang/en';
import { requests } from '../../api/requests';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const LoginPageComponent = Component((): UINode => {
  const [NavigateTo, LoadingPage] = useChildComponents(NavigateToComponent, LoadingPageComponent);

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();
  const route = useRoute();

  if (authService.isLoggedIn)
    return NavigateTo(
      {
        route: 'auth.password',
        search: {
          redirectTo: $route.search.get('redirectTo') ?? '/'
        }
      },
      LoadingPage
    );

  useTitle(() => `${l('pixer.title')} - ${l('login.title')}`);

  const username = useState('');

  const errorKey = useState<TranslationKey | null>(null);
  const isLoading = useState(false);

  const canLogin = useComputed(() => !$isLoading && $username.trim().length >= 3);

  const login = async () => {
    if (!$canLogin) return;

    $isLoading = true;
    $errorKey = null;

    const loginResponse = await apiService.send(requests.user.get, {
      userId: null,
      username: $username.trim(),
      includeEncryptedKeys: true
    });

    $isLoading = false;

    if (loginResponse.error || loginResponse.result == null) {
      $errorKey = 'login.error';
      return;
    }

    const user = loginResponse.result as UserWithEncryptedKeys;
    authService.logIn(user);

    navigate({ route: 'auth.password' });
  };

  return html`
    <div class="fixed w-screen h-screen top-0 left-0 flex flex-col items-center justify-around">
      <div class="flex flex-col gap-3 items-center">
        <div class="flex items-center gap-3">
          <img class="w-10" src="/assets/logo.png" />
          <h1 class="text-5xl font-bold">${l('pixer.title')}</h1>
        </div>
        <h3 class="text-xl text-gray-700 italic">${l('login.description')}</h3>
      </div>
      <div class="flex flex-col gap-6 items-center">
        <div class="flex flex-col gap-1">
          <p class="text-lg italic text-gray-700">${l('login.username')}</p>
          <input
            type="text"
            class="border-gray-600 border-2 rounded-lg text-xl outline-none px-2 py-1"
            :value#=${$username} />
        </div>
        <button
          class="outline-none bg-gray-300 text-gray-800 text-xl rounded-lg py-2 w-1/2"
          .cursor-pointer=${$canLogin}
          .opacity-75=${!$canLogin}
          @click=${login}>
          ${l('login.logIn')}
        </button>
        <p class="italic text-red-600 h-0">${$errorKey ? l($errorKey!) : ''}</p>
      </div>
      <p
        class="underline italic text-gray-600 text-lg cursor-pointer"
        @click=${() => navigate({ route: 'auth.register' })}>
        ${l('login.createAccountText')}
      </p>
    </div>
  `;
});

export default LoginPageComponent;
