import { array, boolean, date, int, nullable, object, string } from '@lib/dto';
import { submission } from '../dto/submission';
import { apiRoutes } from '../APISegment';
import { albumInfo } from '../dto/album';

const APISubmission = apiRoutes({
  name: 'submission',
  routes: [
    {
      name: 'create',
      isAuthenticated: true,
      input: object({
        imageDate: date(),
        imageType: string({ length: int({ max: 128 }) }),
        imageExt: string({ length: int({ max: 12 }) }),
        albumId: albumInfo.id,
        imageSize: int({ max: 8 * 1000 * 1000 }), // 8 mB
        previewSize: int({ max: 128 * 1000 }) // 128 kB
      }),
      result: nullable(
        object({
          submission,
          uploadUrls: object({
            imageUploadUrl: string(),
            previewUploadUrl: string()
          })
        })
      )
    },
    {
      name: 'acceptSubmission',
      isAuthenticated: true,
      input: object({
        submissionId: submission.id
      }),
      result: boolean()
    },
    {
      name: 'rejectSubmission',
      isAuthenticated: true,
      input: object({
        submissionId: submission.id
      }),
      result: boolean()
    },
    {
      name: 'getSubmissions',
      isAuthenticated: true,
      input: object({
        albumId: albumInfo.id,
        skip: int()
      }),
      result: array({ of: submission })
    }
  ]
} as const);

export { APISubmission };
