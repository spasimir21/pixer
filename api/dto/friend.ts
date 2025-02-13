import { date, DTOType, object } from '@lib/dto';
import { user } from './user';

const friendRequest = object({
  createdAt: date(),
  userId: user.id,
  username: user.username
});

type FriendRequest = DTOType<typeof friendRequest>;

const friend = object({
  id: user.id,
  username: user.username
});

type Friend = DTOType<typeof friend>;

export { friendRequest, FriendRequest, friend, Friend };
