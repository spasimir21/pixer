import { APIKeystoreDelete } from './delete';
import { apiSegment } from '../APISegment';
import { APIKeystoreSave } from './save';
import { APIKeystoreGet } from './get';

const APIKeystore = apiSegment({
  name: 'keystore',
  children: [APIKeystoreGet, APIKeystoreSave, APIKeystoreDelete]
} as const);

export { APIKeystore };
