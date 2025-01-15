import { encryptedKey } from './dto/encryptedKey';
import { nullable, object } from '@lib/dto';
import { apiEndpoint } from '../APISegment';
import { userId } from '../dto/userId';

const APIKeystoreGet = apiEndpoint({
  name: 'get',
  input: object({ id: userId }),
  result: nullable(object({ encryptedKey }))
} as const);

export { APIKeystoreGet };
