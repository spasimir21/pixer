import { _enum, date, DTOType, int, object } from '@lib/dto';
import { user } from './user';

const FriendStatus = _enum('Friends', 'NotFriends', 'RequestSent', 'RequestWaiting');

type FriendStatus = DTOType<typeof FriendStatus>;

const userStats = object({
  id: user.id,
  username: user.username,
  createdAt: date(),
  friendStatus: FriendStatus,
  friends: int(),
  uploadedImages: int(),
  createdAlbums: int()
});

type UserStats = DTOType<typeof userStats>;

const userOwnStats = object({
  createdAt: date(),
  friends: int(),
  requests: int(),
  uploadedImages: int(),
  createdAlbums: int()
});

type UserOwnStats = DTOType<typeof userOwnStats>;

export { userStats, UserStats, FriendStatus, userOwnStats, UserOwnStats };
