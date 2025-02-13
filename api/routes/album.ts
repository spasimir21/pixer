import { array, boolean, int, nullable, object, string, uuidV4 } from '@lib/dto';
import { albumInfo, AlbumType } from '../dto/album';
import { apiRoutes } from '../APISegment';
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
          of: user.id
        })
      }),
      result: nullable(albumInfo)
    },
    {
      name: 'getAccessibleAlbumsInfo',
      isAuthenticated: true,
      input: object({
        includeUsers: boolean()
      }),
      result: object({
        own: array({ of: albumInfo }),
        shared: array({ of: albumInfo })
      })
    },
    {
      name: 'getPublicAlbumsInfo',
      input: object({
        albumIds: array({ of: albumInfo.id }),
        includeUsers: boolean()
      }),
      result: array({ of: albumInfo })
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
