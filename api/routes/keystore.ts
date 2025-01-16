import { boolean, nullable, object } from '@lib/dto';
import { encryptedKey } from '../dto/encryptedKey';
import { apiRoutes } from '../APISegment';
import { userId } from '../dto/user';

const APIKeystore = apiRoutes({
  name: 'keystore',
  routes: [
    {
      name: 'get',
      input: object({ userId }),
      result: nullable(object({ encryptedKey }))
    },
    {
      name: 'save',
      isAuthenticated: true,
      input: object({ encryptedKey }),
      result: boolean()
    },
    {
      name: 'delete',
      isAuthenticated: true,
      input: object({}),
      result: boolean()
    }
  ]
} as const);

export { APIKeystore };
