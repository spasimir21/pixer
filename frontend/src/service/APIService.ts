import { AuthenticationService, AuthenticationServiceManager } from './AuthenticationService';
import { createSingletonManager, Service } from '@lib/service';
import { APIRequest } from '../api/requestsFromStructure';
import { sendRequest } from '../api/sendRequest';

class APIService extends Service {
  private readonly authenticationService: AuthenticationService;

  constructor(public readonly apiOrigin: string) {
    super();

    this.authenticationService = this.useService(AuthenticationServiceManager);
  }

  send<TInput, TResult>(input: TInput, request: APIRequest<TInput, TResult>) {
    return sendRequest(input, request, this.apiOrigin, this.authenticationService.authKey);
  }
}

const APIServiceManager = createSingletonManager(() => new APIService(import.meta.env.VITE_API_ORIGIN), false);

export { APIService, APIServiceManager };
