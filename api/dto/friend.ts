import { date, DTOType, object } from '@lib/dto';
import { user } from './user';

const friendRequest = object({
  createdAt: date(),
  userId: user.id,
  username: user.username
});

type FriendRequest = DTOType<typeof friendRequest>;

export { friendRequest, FriendRequest };
