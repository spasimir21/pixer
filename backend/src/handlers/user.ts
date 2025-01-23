import { deepToBuffer, deepToUint8Array, toBuffer } from '../utils/buffer';
import { UserWithEncryptedKeys } from '@api/dto/user';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { User } from '../database/schema/User';
import { toHex } from '@lib/utils/hex';
import { APIHandlers } from './index';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { b2Client } from '../database/b2';

const APIUserHandlers: APIHandlers['user'] = {
  create: async (input, auth) => {
    const existingUser = await User.findOne({ username: input.username });
    if (existingUser != null) return null;

    const user: UserWithEncryptedKeys = {
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
  },
  uploadProfileIcon: async ({ fileSize }, { userId }) => {
    const command = new PutObjectCommand({
      Bucket: 'profile-icons',
      Key: toHex(userId),
      ContentType: 'image/png',
      ContentLength: fileSize
    });

    try {
      return { uploadUrl: await getSignedUrl(b2Client, command, { expiresIn: 60 }) };
    } catch {
      return { uploadUrl: null };
    }
  }
};

export { APIUserHandlers };
