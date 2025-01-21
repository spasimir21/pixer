import { AuthenticationService, AuthenticationServiceManager } from './AuthenticationService';
import { createSingletonManager, Service } from '@lib/service';
import { AuthenticationKey } from '../api/authentication';
import { APIRequest } from '../api/requestsFromStructure';
import { sendRequest } from '../api/sendRequest';

class APIService extends Service {
  private readonly authenticationService: AuthenticationService;

  constructor(public readonly apiOrigin: string) {
    super();

    this.authenticationService = this.useService(AuthenticationServiceManager);
  }

  send<TInput, TResult>(request: APIRequest<TInput, TResult>, input: TInput) {
    return sendRequest(
      request,
      input,
      this.apiOrigin,
      this.authenticationService.isAuthenticated
        ? {
            identityKey: this.authenticationService.keys!.identityKey,
            identityPublicKeyBuffer: this.authenticationService.user!.publicKeys.identityKey
          }
        : null
    );
  }

  sendWithExplicitAuth<TInput, TResult>(
    request: APIRequest<TInput, TResult>,
    input: TInput,
    authKey: AuthenticationKey
  ) {
    return sendRequest(request, input, this.apiOrigin, authKey);
  }
}

const APIServiceManager = createSingletonManager(() => new APIService(import.meta.env.VITE_API_ORIGIN), false);

export { APIService, APIServiceManager };
