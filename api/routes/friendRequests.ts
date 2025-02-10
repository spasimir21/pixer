import { array, boolean, int, object } from '@lib/dto';
import { friendRequest } from '../dto/friendRequest';
import { apiRoutes } from '../APISegment';
import { user } from '../dto/user';

const APIFriendRequests = apiRoutes({
  name: 'friendRequests',
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
          length: int(),
          of: friendRequest
        }),
        incoming: array({
          length: int(),
          of: friendRequest
        })
      })
    }
  ]
} as const);

export { APIFriendRequests };
