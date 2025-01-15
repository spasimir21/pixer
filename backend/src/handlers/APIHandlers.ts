import { APIEndpoint, APIRoutes, APISegment } from '@api/APISegment';
import { API_STRUCTURE } from '@api/structure';
import { DTOType } from '@lib/dto';

interface AuthenticationInfo {}

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

type APIHandlers = APIRouteHandlers<typeof API_STRUCTURE>;

export { APIHandlers, AuthenticationInfo };
