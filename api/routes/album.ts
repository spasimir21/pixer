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
          length: int({ min: 3, max: 128 })
        }),
        type: AlbumType,
        allowSubmissions: boolean(),
        users: array({
          length: int(),
          of: user.id
        })
      }),
      result: nullable(
        object({
          id: uuidV4()
        })
      )
    },
    {
      name: 'uploadAlbumCover',
      isAuthenticated: true,
      input: object({
        albumId: uuidV4(),
        fileSize: int({ max: 512 * 1000 }) // 512 kB
      }),
      result: nullable(
        object({
          coverUploadUrl: string()
        })
      )
    }
  ]
} as const);

export { APIAlbum };
