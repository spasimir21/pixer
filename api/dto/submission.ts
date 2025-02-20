import { date, DTOType, int, object, string, uuidV4 } from '@lib/dto';
import { albumInfo } from './album';
import { userInfo } from './user';

const submission = object({
  id: uuidV4(),
  uploadedAt: date(),
  imageDate: date(),
  imageType: string({ length: int({ max: 128 }) }),
  imageExt: string({ length: int({ max: 12 }) }),
  creator: userInfo,
  albumId: albumInfo.id
});

type Submission = DTOType<typeof submission>;

export { Submission, submission };
