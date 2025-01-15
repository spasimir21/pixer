import { APIKeystoreDelete } from './delete';
import { apiRoutes } from '../APISegment';
import { APIKeystoreSave } from './save';
import { APIKeystoreGet } from './get';

const APIKeystore = apiRoutes({
  name: 'keystore',
  routes: [APIKeystoreGet, APIKeystoreSave, APIKeystoreDelete]
} as const);

export { APIKeystore };
