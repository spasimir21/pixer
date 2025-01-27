import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UserWithEncryptedKeys } from '@api/dto/user';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { b2Client } from '../data/b2Client';
import { dbClient } from '../data/dbClient';
import { toHex } from '@lib/utils/hex';
import { APIHandlers } from './index';

const APIUserHandlers: APIHandlers['user'] = {
  create: async (input, auth) => {
    const existingUser = await dbClient.user.findFirst({ where: { username: input.username } });
    if (existingUser != null) return null;

    const user: UserWithEncryptedKeys = {
      id: auth.userId,
      ...input
    };

    await dbClient.user.create({
      data: {
        id: user.id,
        username: user.username,
        ...user.publicKeys,
        encryptedKeys: { create: user.encryptedKeys }
      }
    });

    return user;
  },
  get: async ({ userId, username, includeEncryptedKeys }) => {
    if (userId == null && username == null) return null;

    const user = await dbClient.user.findFirst({
      where: userId == null ? { username: username! } : { id: userId },
      include: {
        encryptedKeys: includeEncryptedKeys ? { omit: { userId: true } } : false
      }
    });

    if (user == null) return null;

    return {
      id: user.id,
      username: user.username,
      publicKeys: {
        identityKey: user.identityKey,
        encryptionKey: user.encryptionKey
      },
      encryptedKeys: user.encryptedKeys
    };
  },
  getStats: async ({ userId, username }) => {
    if (userId == null && username == null) return null;

    const user = await dbClient.user.findFirst({
      where: userId == null ? { username: username! } : { id: userId },
      select: { id: true, username: true, createdAt: true }
    });

    if (user == null) return null;

    return {
      ...user,
      uploadedImages: 0,
      createdAlbums: 0
    };
  },
  uploadProfileIcon: async ({ fullFileSize, smallFileSize }, { userId }) => {
    const fullSizeCommand = new PutObjectCommand({
      Bucket: 'profile-icons',
      Key: `full/${toHex(userId)}`,
      ContentType: 'image/png',
      ContentLength: fullFileSize
    });

    const smallSizeCommand = new PutObjectCommand({
      Bucket: 'profile-icons',
      Key: `small/${toHex(userId)}`,
      ContentType: 'image/png',
      ContentLength: smallFileSize
    });

    try {
      return {
        fullUploadUrl: await getSignedUrl(b2Client, fullSizeCommand, { expiresIn: 60 }),
        smallUploadUrl: await getSignedUrl(b2Client, smallSizeCommand, { expiresIn: 60 })
      };
    } catch {
      return null;
    }
  }
};

export { APIUserHandlers };
