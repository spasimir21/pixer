import { encryptedKey } from './dto/encryptedKey';
import { nullable, object } from '@lib/dto';
import { apiSegment } from '../APISegment';
import { userId } from '../dto/userId';

const APIKeystoreGet = apiSegment({
  name: 'get',
  input: object({ id: userId }),
  output: nullable(object({ encryptedKey }))
} as const);

export { APIKeystoreGet };
