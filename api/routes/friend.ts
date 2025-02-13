import { array, boolean, int, object } from '@lib/dto';
import { friend, friendRequest } from '../dto/friend';
import { apiRoutes } from '../APISegment';
import { user } from '../dto/user';

const APIFriend = apiRoutes({
  name: 'friend',
  routes: [
    {
      name: 'sendRequest',
      isAuthenticated: true,
      input: object({ to: user.id }),
      result: boolean()
    },
    {
      name: 'cancelRequest',
      isAuthenticated: true,
      input: object({ to: user.id }),
      result: boolean()
    },
    {
      name: 'acceptRequest',
      isAuthenticated: true,
      input: object({ from: user.id }),
      result: boolean()
    },
    {
      name: 'rejectRequest',
      isAuthenticated: true,
      input: object({ from: user.id }),
      result: boolean()
    },
    {
      name: 'getRequests',
      isAuthenticated: true,
      input: object({}),
      result: object({
        outgoing: array({
          of: friendRequest
        }),
        incoming: array({
          of: friendRequest
        })
      })
    },
    {
      name: 'getFriends',
      isAuthenticated: true,
      input: object({}),
      result: array({
        of: friend
      })
    },
    {
      name: 'unfriend',
      isAuthenticated: true,
      input: object({ userId: user.id }),
      result: boolean()
    }
  ]
} as const);

export { APIFriend };
