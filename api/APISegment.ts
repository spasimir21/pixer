import { DTO } from '@lib/dto';

interface APIRoutes {
  name: string;
  routes: APISegment[];
}

interface APIEndpoint {
  name: string;
  isAuthenticated?: boolean;
  input: DTO;
  result: DTO;
}

type APISegment = APIRoutes | APIEndpoint;

const apiEndpoint = <T extends APIEndpoint>(endpoint: T) => endpoint;
const apiRoutes = <T extends APIRoutes>(routes: T) => routes;

export { APISegment, APIRoutes, APIEndpoint, apiRoutes, apiEndpoint };
