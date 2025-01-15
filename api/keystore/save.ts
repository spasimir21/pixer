import { encryptedKey } from './dto/encryptedKey';
import { boolean, object } from '@lib/dto';
import { apiSegment } from '../APISegment';

const APIKeystoreSave = apiSegment({
  name: 'save',
  isAuthenticated: true,
  input: object({ encryptedKey }),
  output: boolean()
} as const);

export { APIKeystoreSave };
