import { array, boolean, int, nullable, object, string, uuidV4 } from '@lib/dto';
import { apiRoutes } from '../APISegment';
import { AlbumType } from '../dto/album';
import { user } from '../dto/user';

const APIAlbum = apiRoutes({
  name: 'album',
  routes: [
    {
      name: 'create',
      isAuthenticated: true,
      input: object({
        name: string({
          length: int({ max: 128 })
        }),
        type: AlbumType,
        allowSubmissions: boolean(),
        users: array({
          length: int(),
          of: user.id
        })
      }),
      result: nullable(uuidV4())
    }
  ]
} as const);

export { APIAlbum };
