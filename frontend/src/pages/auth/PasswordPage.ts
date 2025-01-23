import { Component, useChildComponents, useComputed, useState, useTimeout } from '@lib/component';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { ProfileIconComponent } from '../../components/ProfileIcon/ProfileIcon';
import { useNavigation, useRoute, useTitle } from '@lib/router';
import { importUserEncryptedKeys } from '../../logic/crypto';
import LoadingPageComponent from '../LoadingPage';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const PasswordPageComponent = Component((): UINode => {
  const [LoadingPage, ProfileIcon] = useChildComponents(LoadingPageComponent, ProfileIconComponent);

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

  useTitle('PiXer - Password');

  const password = useState('password1234');

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

  enter();

  return html`
    <div class="fixed w-screen h-screen top-0 left-0 flex flex-col items-center justify-around">
      <div class="flex flex-col gap-3 items-center">
        <div class="flex items-center gap-3">
          <img class="w-10" src="/assets/logo.png" alt="PiXer Logo" />
          <h1 class="text-5xl font-bold">PiXer</h1>
        </div>
        <h3 class="text-xl text-gray-700 italic">Enter your password</h3>
      </div>
      <div class="flex flex-col gap-6 items-center">
        <div class="flex items-center gap-4 self-stretch">
          ${ProfileIcon({
            userId: () => authService.user?.id ?? null,
            classes: 'w-14 h-14'
          })}

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
