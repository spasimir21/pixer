import { publicKey } from '../dto/publicKey';
import { nullable, object } from '@lib/dto';
import { user, username } from './dto/user';
import { apiEndpoint } from '../APISegment';

const APIUserCreate = apiEndpoint({
  name: 'create',
  input: object({
    username,
    publicKey
  }),
  result: nullable(user)
} as const);

export { APIUserCreate };
