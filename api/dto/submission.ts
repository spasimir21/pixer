import { date, DTOType, object, uuidV4 } from '@lib/dto';
import { albumInfo } from './album';
import { userInfo } from './user';

const submission = object({
  id: uuidV4(),
  uploadedAt: date(),
  imageDate: date(),
  creator: userInfo,
  albumId: albumInfo.id
});

type Submission = DTOType<typeof submission>;

export { Submission, submission };
