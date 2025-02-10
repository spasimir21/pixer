import { _enum, date, DTOType, int, object } from '@lib/dto';
import { user } from './user';

const friendStatus = _enum('friends', 'not-friends', 'request-sent', 'request-waiting');

type FriendStatus = DTOType<typeof friendStatus>;

const userStats = object({
  id: user.id,
  username: user.username,
  createdAt: date(),
  friendStatus,
  friends: int(),
  uploadedImages: int(),
  createdAlbums: int()
});

type UserStats = DTOType<typeof userStats>;

export { userStats, UserStats, friendStatus, FriendStatus };
