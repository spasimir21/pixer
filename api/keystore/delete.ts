import { boolean, object } from '@lib/dto';
import { apiSegment } from '../APISegment';

const APIKeystoreDelete = apiSegment({
  name: 'delete',
  isAuthenticated: true,
  input: object({}),
  output: boolean()
} as const);

export { APIKeystoreDelete };
