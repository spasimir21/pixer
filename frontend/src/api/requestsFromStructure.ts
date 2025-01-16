import { APIEndpoint, APIRoutes, APISegment } from '@api/APISegment';
import { DTO, DTOType } from '@lib/dto';

interface APIRequest<TInput, TResult> {
  path: string;
  isAuthenticated: boolean;
  input: DTO<TInput>;
  result: DTO<TResult>;
}

// prettier-ignore
type RequestsFromStructure<T extends readonly APISegment[]> = {
  [S in T[number] as S['name']]:
      S extends APIEndpoint ? APIRequest<DTOType<S['input']>, DTOType<S['result']>>
    : S extends APIRoutes ? RequestsFromStructure<S['routes']>
    : never;
};

function requestsFromStructure<T extends readonly APISegment[]>(structure: T, path = ''): RequestsFromStructure<T> {
  const requests: any = {};

  for (const segment of structure)
    requests[segment.name] =
      'routes' in segment
        ? requestsFromStructure(segment.routes, `/${segment.name}`)
        : ({
            path: path + `/${segment.name}`,
            isAuthenticated: segment.isAuthenticated ?? false,
            input: segment.input,
            result: segment.result
          } satisfies APIRequest<any, any>);

  return requests;
}

export { requestsFromStructure, APIRequest };
