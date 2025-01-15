import { apiSegment } from '../APISegment';
import { APIUserCreate } from './create';
import { APIUserGet } from './get';

const APIUser = apiSegment({
  name: 'user',
  children: [APIUserCreate, APIUserGet]
} as const);

export { APIUser };
