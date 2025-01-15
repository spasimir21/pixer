import { apiEndpoint } from '../APISegment';
import { boolean, object } from '@lib/dto';

const APIKeystoreDelete = apiEndpoint({
  name: 'delete',
  isAuthenticated: true,
  input: object({}),
  result: boolean()
} as const);

export { APIKeystoreDelete };
