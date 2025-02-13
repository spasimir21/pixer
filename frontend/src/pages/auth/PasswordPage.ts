import { Component, useChildComponents, useComputed, useState } from '@lib/component';
import { NavigateToComponent, useNavigation, useRoute, useTitle } from '@lib/router';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { ProfileIconComponent } from '../../components/ProfileIcon/ProfileIcon';
import { useLocalization } from '../../service/LocalizationService';
import { importUserEncryptedKeys } from '../../logic/crypto';
import LoadingPageComponent from '../LoadingPage';
import { TranslationKey } from '../../lang/en';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const PasswordPageComponent = Component((): UINode => {
  const [NavigateTo, LoadingPage, ProfileIcon] = useChildComponents(
    NavigateToComponent,
    LoadingPageComponent,
    ProfileIconComponent
  );

  const authService = useService(AuthenticationServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();
  const route = useRoute();

  if (!authService.isLoggedIn)
    return NavigateTo(
      {
        route: 'auth.login',
        search: {
          redirectTo: $route.search.get('redirectTo') ?? '/'
        }
      },
      LoadingPage
    );

  if (authService.isAuthenticated) return NavigateTo($route.search.get('redirectTo') ?? '/', LoadingPage);

  useTitle(() => `${l('pixer.title')} - ${l('password.title')} (${authService.user?.username})`);

  const password = useState('');

  const errorKey = useState<TranslationKey | null>(null);
  const isLoading = useState(false);

  const canEnter = useComputed(() => !$isLoading && $password.trim().length > 3);

  const enter = async () => {
    if (!$canEnter) return;

    $isLoading = true;
    $errorKey = null;

    try {
      const keys = await importUserEncryptedKeys(
        authService.user!.encryptedKeys,
        authService.user!.publicKeys,
        $password.trim()
      );

      authService.authenticate(keys);

      navigate($route.search.get('redirectTo') ?? '/');
    } catch {
      $errorKey = 'password.error';
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

  // TODO: remove
  $password = 'password1234';
  enter();

  return html`
    <div class="fixed w-screen h-screen top-0 left-0 flex flex-col items-center justify-around">
      <div class="flex flex-col gap-3 items-center">
        <div class="flex items-center gap-3">
          <img class="w-10" src="/assets/logo.png" />
          <h1 class="text-5xl font-bold">${l('pixer.title')}</h1>
        </div>
        <h3 class="text-xl text-gray-700 italic">${l('password.description')}</h3>
      </div>
      <div class="flex flex-col gap-6 items-center">
        <div class="flex items-center gap-4 self-stretch">
          ${ProfileIcon({
            userId: () => authService.user?.id ?? null,
            classes: 'w-14 h-14'
          })}

          <div class="flex flex-col">
            <p class="text-xl text-gray-700 italic">${l('password.loggedInAs')}</p>
            <p class="text-xl text-black font-bold">${authService.user?.username}</p>
          </div>
        </div>
        <input
          type="password"
          class="border-gray-600 border-2 rounded-lg text-xl outline-none px-2 py-1"
          placeholder=${l('password.password')}
          :value#=${$password} />
        <button
          class="outline-none bg-gray-300 text-gray-800 text-xl rounded-lg py-2 w-1/2"
          .cursor-pointer=${$canEnter}
          .opacity-75=${!$canEnter}
          @click=${enter}>
          ${l('password.enter')}
        </button>
        <p class="italic text-red-600 h-0">${$errorKey ? l($errorKey!) : ''}</p>
      </div>
      <p class="underline italic text-gray-600 text-lg cursor-pointer" @click=${logout}>
        ${l('password.tryADifferentAccountText')}
      </p>
    </div>
  `;
});

export default PasswordPageComponent;
