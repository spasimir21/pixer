import { array, boolean, int, nullable, object, string, uuidV4 } from '@lib/dto';
import { albumInfo, albumInfoWithUsers, AlbumType } from '../dto/album';
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
      name: 'edit',
      isAuthenticated: true,
      input: object({
        id: albumInfo.id,
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
      name: 'delete',
      isAuthenticated: true,
      input: object({
        id: albumInfo.id
      }),
      result: boolean()
    },
    {
      name: 'getAccessibleAlbumsInfo',
      isAuthenticated: true,
      input: object({
        includeUsers: boolean()
      }),
      result: object({
        own: array({ of: albumInfo }),
        shared: array({ of: albumInfo }),
        pinned: array({ of: albumInfo })
      })
    },
    {
      name: 'getAlbumInfo',
      isAuthenticated: true,
      input: object({
        albumId: albumInfo.id
      }),
      result: nullable(albumInfoWithUsers)
    },
    {
      name: 'pinAlbum',
      isAuthenticated: true,
      input: object({
        albumId: albumInfo.id
      }),
      result: boolean()
    },
    {
      name: 'unpinAlbum',
      isAuthenticated: true,
      input: object({
        albumId: albumInfo.id
      }),
      result: boolean()
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
