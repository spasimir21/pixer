import { APIEndpoint, APIRoutes, APISegment } from '@api/APISegment';
import { AuthenticationInfo } from './authentication';
import { DTOType } from '@lib/dto';

type APIEndpointHandler<T extends APIEndpoint> = (
  input: DTOType<T['input']>,
  authenticationInfo: T['isAuthenticated'] extends true ? AuthenticationInfo : null
) => Promise<DTOType<T['result']>>;

// prettier-ignore
type APIRouteHandlers<T extends readonly APISegment[]> = {
  [S in T[number] as S['name']]:
      S extends APIEndpoint ? APIEndpointHandler<S>
    : S extends APIRoutes ? APIRouteHandlers<S['routes']>
    : never;
};

export { APIRouteHandlers, APIEndpointHandler };
