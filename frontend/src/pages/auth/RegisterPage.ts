import { exportUserEncryptedKeys, exportUserPublicKeys, generateUserKeys } from '../../logic/crypto';
import { Component, useChildComponents, useComputed, useState, useTimeout } from '@lib/component';
import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { APIServiceManager } from '../../service/APIService';
import { useNavigation, useRoute } from '@lib/router';
import LoadingPageComponent from '../LoadingPage';
import { requests } from '../../api/requests';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { user } from '@api/dto/user';
import { validate } from '@lib/dto';

const RegisterPageComponent = Component((): UINode => {
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

  const formData = useState({
    username: '',
    password: ''
  });

  const isLoading = useState(false);
  const error = useState('');

  const isUsernameValid = useComputed(() => validate($formData.username.trim(), user.username));

  const shouldUsernameBeRed = useComputed(() => $formData.username.trim().length >= 3 && !$isUsernameValid);

  const canRegister = useComputed(() => !$isLoading && $isUsernameValid && $formData.password.trim().length >= 3);

  const register = async () => {
    if (!$canRegister) return;

    $isLoading = true;
    $error = '';

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
      $error = 'This user already exists!';
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
          <img class="w-10" src="/icon.png" alt="PiXer Logo" />
          <h1 class="text-5xl font-bold">PiXer</h1>
        </div>
        <h3 class="text-xl text-gray-700 italic">Create your new account</h3>
      </div>
      <div class="flex flex-col gap-8 items-center">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <p class=${`text-lg italic ${$shouldUsernameBeRed ? 'text-red-600' : 'text-gray-700'}`}>Username</p>
            <input
              type="text"
              class=${`${
                $shouldUsernameBeRed ? 'border-red-600' : 'border-gray-600'
              } border-2 rounded-lg text-xl outline-none px-2 py-1`}
              :value#=${$formData.username} />
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-lg italic text-gray-700">Password</p>
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
          Register
        </button>
        <p class="italic text-red-600 h-0">${$error}</p>
      </div>
      <p
        class="underline italic text-gray-600 text-lg cursor-pointer"
        @click=${() => navigate({ route: 'auth.login' })}>
        Or log into your account
      </p>
    </div>
  `;
});

export default RegisterPageComponent;
