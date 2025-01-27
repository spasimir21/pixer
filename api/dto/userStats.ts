import { date, DTOType, int, object } from '@lib/dto';
import { user } from './user';

const userStats = object({
  id: user.id,
  username: user.username,
  createdAt: date(),
  uploadedImages: int(),
  createdAlbums: int()
});

type UserStats = DTOType<typeof userStats>;

export { userStats, UserStats };
