import { Component, useChildComponents, useComputed, useState, useTimeout } from '@lib/component';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { importUserEncryptedKeys } from '../../logic/crypto';
import { useNavigation, useRoute } from '@lib/router';
import LoadingPageComponent from '../LoadingPage';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const PasswordPageComponent = Component((): UINode => {
  const [LoadingPage] = useChildComponents(LoadingPageComponent);

  const authService = useService(AuthenticationServiceManager);
  const { navigate } = useNavigation();
  const route = useRoute();

  if (!authService.isLoggedIn) {
    useTimeout(
      () =>
        navigate({
          route: 'auth.login',
          search: {
            redirectTo: $route.search.get('redirectTo') ?? '/'
          }
        }),
      0
    );

    return LoadingPage();
  }

  if (authService.isAuthenticated) {
    useTimeout(() => navigate($route.search.get('redirectTo') ?? '/'), 0);
    return LoadingPage();
  }

  const password = useState('');

  const isLoading = useState(false);
  const error = useState('');

  const canEnter = useComputed(() => !$isLoading && $password.trim().length > 3);

  const enter = async () => {
    if (!$canEnter) return;

    $isLoading = true;
    $error = '';

    try {
      const keys = await importUserEncryptedKeys(
        authService.user!.encryptedKeys,
        authService.user!.publicKeys,
        $password.trim()
      );

      authService.authenticate(keys);

      navigate($route.search.get('redirectTo') ?? '/');
    } catch {
      $error = 'Incorrect password!';
    }

    $isLoading = false;
  };

  const logout = () => {
    authService.logOut();

    navigate({
      route: 'auth.login',
      search: {
        redirectTo: $route.search.get('redirectTo') ?? '/'
      }
    });
  };

  return html`
    <div class="fixed w-screen h-screen top-0 left-0 flex flex-col items-center justify-around">
      <div class="flex flex-col gap-3 items-center">
        <div class="flex items-center gap-3">
          <img class="w-10" src="/icon.png" alt="PiXer Logo" />
          <h1 class="text-5xl font-bold">PiXer</h1>
        </div>
        <h3 class="text-xl text-gray-700 italic">Enter your password</h3>
      </div>
      <div class="flex flex-col gap-6 items-center">
        <div class="flex items-center gap-4 self-stretch">
          <img src="/profile.png" alt="Profile Picture" class="h-14" />
          <div class="flex flex-col">
            <p class="text-xl text-gray-700 italic">Logged in as</p>
            <p class="text-xl text-black font-bold">${authService.user?.username}</p>
          </div>
        </div>
        <input
          type="password"
          class="border-gray-600 border-2 rounded-lg text-xl outline-none px-2 py-1"
          placeholder="Password"
          :value#=${$password} />
        <button
          class="outline-none bg-gray-300 text-gray-800 text-xl rounded-lg py-2 w-1/2"
          .cursor-pointer=${$canEnter}
          .opacity-75=${!$canEnter}
          @click=${enter}>
          Enter
        </button>
        <p class="italic text-red-600 h-0">${$error}</p>
      </div>
      <p class="underline italic text-gray-600 text-lg cursor-pointer" @click=${logout}>Or try a different account</p>
    </div>
  `;
});

export default PasswordPageComponent;
