import { publicKey } from '../dto/publicKey';
import { nullable, object } from '@lib/dto';
import { user, username } from './dto/user';
import { apiSegment } from '../APISegment';

const APIUserCreate = apiSegment({
  name: 'create',
  input: object({
    username,
    publicKey
  }),
  output: nullable(user)
} as const);

export { APIUserCreate };
