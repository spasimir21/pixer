import { either, nullable, object } from '@lib/dto';
import { publicKey } from '../dto/publicKey';
import { user, username } from './dto/user';
import { apiEndpoint } from '../APISegment';

// prettier-ignore
const APIUserGet = apiEndpoint({
  name: 'get',
  input: either({
    choose: input => 'username' in input ? 0 : 1,
    options: [
      object({ username }),
      object({ publicKey })
    ]
  }),
  result: nullable(user)
} as const);

export { APIUserGet };
