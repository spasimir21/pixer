import { apiRoutes } from '../APISegment';
import { APIUserCreate } from './create';
import { APIUserGet } from './get';

const APIUser = apiRoutes({
  name: 'user',
  routes: [APIUserCreate, APIUserGet]
} as const);

export { APIUser };
