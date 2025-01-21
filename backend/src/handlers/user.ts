import { User } from '../database/schema/User';
import { deepToBuffer, deepToUint8Array, toBuffer } from '../utils/buffer';
import { APIHandlers } from './index';

const APIUserHandlers: APIHandlers['user'] = {
  create: async (input, auth) => {
    const existingUser = await User.findOne({ username: input.username });
    if (existingUser != null) return null;

    const user = {
      id: auth.userId,
      ...input
    };

    await User.create(deepToBuffer(user));

    return user;
  },
  get: async ({ userId, username, includeEncryptedKeys }) => {
    if (userId == null && username == null) return null;

    const user = await User.findOne(
      userId != null ? { id: toBuffer(userId) } : { username },
      includeEncryptedKeys ? undefined : '-encryptedKeys'
    );

    if (user == null) return null;

    return deepToUint8Array({
      id: user.id,
      username: user.username,
      publicKeys: user.publicKeys,
      encryptedKeys: user.encryptedKeys ?? null
    });
  }
};

export { APIUserHandlers };
