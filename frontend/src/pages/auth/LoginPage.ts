import { Component, useChildComponents, useComputed, useState, useTimeout } from '@lib/component';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { APIServiceManager } from '../../service/APIService';
import { useNavigation, useRoute } from '@lib/router';
import { UserWithEncryptedKeys } from '@api/dto/user';
import LoadingPageComponent from '../LoadingPage';
import { requests } from '../../api/requests';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const LoginPageComponent = Component((): UINode => {
  const [LoadingPage] = useChildComponents(LoadingPageComponent);

  const authService = useService(AuthenticationServiceManager);
  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const route = useRoute();

  if (authService.isLoggedIn) {
    useTimeout(
      () =>
        navigate({
          route: 'auth.password',
          search: {
            redirectTo: $route.search.get('redirectTo') ?? '/'
          }
        }),
      0
    );

    return LoadingPage();
  }

  const username = useState('');

  const isLoading = useState(false);
  const error = useState('');

  const canLogin = useComputed(() => !$isLoading && $username.trim().length >= 3);

  const login = async () => {
    if (!$canLogin) return;

    $isLoading = true;
    $error = '';

    const loginResponse = await apiService.send(requests.user.get, {
      userId: null,
      username: $username.trim(),
      includeEncryptedKeys: true
    });

    $isLoading = false;

    if (loginResponse.error || loginResponse.result == null) {
      $error = 'No such user exists!';
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
          <img class="w-10" src="/icon.png" alt="PiXer Logo" />
          <h1 class="text-5xl font-bold">PiXer</h1>
        </div>
        <h3 class="text-xl text-gray-700 italic">Log into your account</h3>
      </div>
      <div class="flex flex-col gap-6 items-center">
        <div class="flex flex-col gap-1">
          <p class="text-lg italic text-gray-700">Username</p>
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
          Log in
        </button>
        <p class="italic text-red-600 h-0">${$error}</p>
      </div>
      <p
        class="underline italic text-gray-600 text-lg cursor-pointer"
        @click=${() => navigate({ route: 'auth.register' })}>
        Or create an account
      </p>
    </div>
  `;
});

export default LoginPageComponent;
