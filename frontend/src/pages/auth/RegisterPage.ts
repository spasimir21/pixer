import { exportUserEncryptedKeys, exportUserPublicKeys, generateUserKeys } from '../../logic/crypto';
import { Component, useChildComponents, useComputed, useState } from '@lib/component';
import { NavigateToComponent, useNavigation, useRoute, useTitle } from '@lib/router';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { useLocalization } from '../../service/LocalizationService';
import { APIServiceManager } from '../../service/APIService';
import LoadingPageComponent from '../LoadingPage';
import { TranslationKey } from '../../lang/en';
import { requests } from '../../api/requests';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { user } from '@api/dto/user';
import { validate } from '@lib/dto';

const RegisterPageComponent = Component((): UINode => {
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

  useTitle(() => `${l('pixer.title')} - ${l('register.title')}`);

  const formData = useState({
    username: '',
    password: ''
  });

  const errorKey = useState<TranslationKey | null>(null);
  const isLoading = useState(false);

  const isUsernameValid = useComputed(() => validate($formData.username.trim(), user.username));

  const shouldUsernameBeRed = useComputed(() => $formData.username.trim().length >= 3 && !$isUsernameValid);

  const canRegister = useComputed(() => !$isLoading && $isUsernameValid && $formData.password.trim().length >= 3);

  const register = async () => {
    if (!$canRegister) return;

    $isLoading = true;
    $errorKey = null;

    const keys = await generateUserKeys();

    const publicKeys = await exportUserPublicKeys(keys);

    const registerResponse = await apiService.sendWithExplicitAuth(
      requests.user.create,
      {
        username: $formData.username.trim(),
        publicKeys,
        encryptedKeys: await exportUserEncryptedKeys(keys, $formData.password.trim())
      },
      {
        identityKey: keys.identityKey,
        identityPublicKeyBuffer: publicKeys.identityKey
      }
    );

    $isLoading = false;

    if (registerResponse.error || registerResponse.result == null) {
      $errorKey = 'register.error';
      return;
    }

    const user = registerResponse.result;

    authService.logIn(user);
    authService.authenticate(keys);

    navigate($route.search.get('redirectTo') ?? '/');
  };

  return html`
    <div class="fixed w-screen h-screen top-0 left-0 flex flex-col items-center justify-around">
      <div class="flex flex-col gap-3 items-center">
        <div class="flex items-center gap-3">
          <img class="w-10" src="/assets/logo.png" />
          <h1 class="text-5xl font-bold">${l('pixer.title')}</h1>
        </div>
        <h3 class="text-xl text-gray-700 italic">${l('register.description')}</h3>
      </div>
      <div class="flex flex-col gap-8 items-center">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <p class=${`text-lg italic ${$shouldUsernameBeRed ? 'text-red-600' : 'text-gray-700'}`}>
              ${l('register.username')}
            </p>
            <input
              type="text"
              class=${`${
                $shouldUsernameBeRed ? 'border-red-600' : 'border-gray-600'
              } border-2 rounded-lg text-xl outline-none px-2 py-1`}
              :value#=${$formData.username} />
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-lg italic text-gray-700">${l('register.password')}</p>
            <input
              type="password"
              class="border-gray-600 border-2 rounded-lg text-xl outline-none px-2 py-1"
              :value#=${$formData.password} />
          </div>
        </div>
        <button
          class="outline-none bg-gray-300 text-gray-800 text-xl rounded-lg py-2 w-1/2"
          .cursor-pointer=${$canRegister}
          .opacity-75=${!$canRegister}
          @click=${register}>
          ${l('register.register')}
        </button>
        <p class="italic text-red-600 h-0">${$errorKey ? l($errorKey!) : ''}</p>
      </div>
      <p
        class="underline italic text-gray-600 text-lg cursor-pointer"
        @click=${() => navigate({ route: 'auth.login' })}>
        ${l('register.logInText')}
      </p>
    </div>
  `;
});

export default RegisterPageComponent;
