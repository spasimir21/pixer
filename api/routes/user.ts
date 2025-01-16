import { user, userId, username } from '../dto/user';
import { either, nullable, object } from '@lib/dto';
import { apiRoutes } from '../APISegment';

const APIUser = apiRoutes({
  name: 'user',
  routes: [
    {
      name: 'create',
      isAuthenticated: true,
      input: object({ username }),
      result: nullable(user)
    },
    {
      name: 'get',
      input: either({
        choose: input => ('username' in input ? 0 : 1),
        options: [object({ username }), object({ userId })]
      }),
      result: nullable(user)
    }
  ]
} as const);

export { APIUser };
