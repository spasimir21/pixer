import { boolean, int, nullable, object, string } from '@lib/dto';
import { user, userWithEncryptedKeys } from '../dto/user';
import { userStats } from '../dto/userStats';
import { apiRoutes } from '../APISegment';

const APIUser = apiRoutes({
  name: 'user',
  routes: [
    {
      name: 'create',
      isAuthenticated: true,
      input: userWithEncryptedKeys.without('id'),
      result: nullable(userWithEncryptedKeys)
    },
    {
      name: 'get',
      input: object({
        userId: nullable(user.id),
        username: nullable(user.username),
        includeEncryptedKeys: boolean()
      }),
      result: nullable(user)
    },
    {
      name: 'getStats',
      isAuthenticated: true,
      input: object({
        userId: nullable(user.id),
        username: nullable(user.username)
      }),
      result: nullable(userStats)
    },
    {
      name: 'uploadProfileIcon',
      isAuthenticated: true,
      input: object({
        fullFileSize: int({ max: 256 * 1000 }), // 256 kB
        smallFileSize: int({ max: 16 * 1000 }) // 16 kB
      }),
      result: nullable(
        object({
          fullUploadUrl: string(),
          smallUploadUrl: string()
        })
      )
    }
  ]
} as const);

export { APIUser };
