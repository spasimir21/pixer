import { encryptedKey } from './dto/encryptedKey';
import { apiEndpoint } from '../APISegment';
import { boolean, object } from '@lib/dto';

const APIKeystoreSave = apiEndpoint({
  name: 'save',
  isAuthenticated: true,
  input: object({ encryptedKey }),
  result: boolean()
} as const);

export { APIKeystoreSave };
