import { array, boolean, date, int, nullable, object, string } from '@lib/dto';
import { image, imageKey } from '../dto/image';
import { apiRoutes } from '../APISegment';
import { albumInfo } from '../dto/album';

const APIImage = apiRoutes({
  name: 'image',
  routes: [
    {
      name: 'create',
      isAuthenticated: true,
      input: object({
        imageDate: date(),
        imageType: string({ length: int({ max: 128 }) }),
        imageExt: string({ length: int({ max: 12 }) }),
        keys: nullable(array({ of: imageKey })),
        albumId: albumInfo.id,
        imageSize: int({ max: 8 * 1000 * 1000 }), // 8 mB
        previewSize: int({ max: 128 * 1000 }) // 128 kB
      }),
      result: nullable(
        object({
          image,
          uploadUrls: object({
            imageUploadUrl: string(),
            previewUploadUrl: string()
          })
        })
      )
    },
    {
      name: 'deleteImage',
      isAuthenticated: true,
      input: object({
        imageId: image.id
      }),
      result: boolean()
    },
    {
      name: 'getImages',
      isAuthenticated: true,
      input: object({
        albumId: albumInfo.id,
        filters: object({
          from: nullable(date()),
          upTo: nullable(date())
        }),
        skip: int()
      }),
      result: array({ of: image })
    }
  ]
} as const);

export { APIImage };
