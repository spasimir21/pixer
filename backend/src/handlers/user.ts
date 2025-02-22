import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { toBuffer, toUint8Array } from '../utils/buffer';
import { UserWithEncryptedKeys } from '@api/dto/user';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { FriendStatus } from '@api/dto/userStats';
import { b2Client } from '../data/b2Client';
import { dbClient } from '../data/dbClient';
import { AlbumType } from '@prisma/client';
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
        id: toBuffer(user.id),
        username: user.username,
        identityKey: toBuffer(user.publicKeys.identityKey),
        encryptionKey: toBuffer(user.publicKeys.encryptionKey),
        encryptedKeys: {
          create: {
            passwordSalt: toBuffer(user.encryptedKeys.passwordSalt),
            identityKey: toBuffer(user.encryptedKeys.identityKey),
            identityKeyIv: toBuffer(user.encryptedKeys.identityKeyIv),
            encryptionKey: toBuffer(user.encryptedKeys.encryptionKey),
            encryptionKeyIv: toBuffer(user.encryptedKeys.encryptionKeyIv)
          }
        }
      }
    });

    return user;
  },
  getUser: async ({ userId, username, includeEncryptedKeys }) => {
    if (userId == null && username == null) return null;

    const user = await dbClient.user.findFirst({
      where: userId == null ? { username: username! } : { id: toBuffer(userId) },
      include: { encryptedKeys: includeEncryptedKeys }
    });

    if (user == null) return null;

    return {
      id: toUint8Array(user.id),
      username: user.username,
      publicKeys: {
        identityKey: toUint8Array(user.identityKey),
        encryptionKey: toUint8Array(user.encryptionKey)
      },
      encryptedKeys: {
        passwordSalt: toUint8Array(user.encryptedKeys!.passwordSalt),
        identityKey: toUint8Array(user.encryptedKeys!.identityKey),
        identityKeyIv: toUint8Array(user.encryptedKeys!.identityKeyIv),
        encryptionKey: toUint8Array(user.encryptedKeys!.encryptionKey),
        encryptionKeyIv: toUint8Array(user.encryptedKeys!.encryptionKeyIv)
      }
    };
  },
  getPublicKeys: async ({ userIds }) => {
    const users = await dbClient.user.findMany({
      where: {
        id: { in: userIds.map(toBuffer) }
      },
      select: {
        id: true,
        identityKey: true,
        encryptionKey: true
      }
    });

    return users.map(user => ({
      userId: toUint8Array(user.id),
      identityKey: toUint8Array(user.identityKey),
      encryptionKey: toUint8Array(user.encryptionKey)
    }));
  },
  getOwnStats: async ({}, { userId }) => {
    const [user, requests] = await dbClient.$transaction([
      dbClient.user.findFirst({
        where: { id: toBuffer(userId) },
        select: {
          createdAt: true,
          _count: {
            select: {
              friendRequests: { where: { accepted: true } },
              sentFriendRequests: { where: { accepted: true } },
              createdAlbums: true,
              uploadedImages: true
            }
          }
        }
      }),
      dbClient.friendRequest.count({
        where: {
          recipientId: toBuffer(userId),
          accepted: false
        }
      })
    ]);

    if (user == null) return null;

    return {
      createdAt: user.createdAt,
      friends: user._count.friendRequests + user._count.sentFriendRequests,
      requests,
      uploadedImages: user._count.uploadedImages,
      createdAlbums: user._count.createdAlbums
    };
  },
  getStats: async ({ userId, username }, { userId: meId }) => {
    if (userId == null && username == null) return null;

    const user = await dbClient.user.findFirst({
      where: userId == null ? { username: username! } : { id: toBuffer(userId) },
      select: {
        id: true,
        username: true,
        createdAt: true,
        _count: {
          select: {
            friendRequests: { where: { accepted: true } },
            sentFriendRequests: { where: { accepted: true } },
            createdAlbums: { where: { type: AlbumType.PUBLIC } },
            uploadedImages: { where: { isEncrypted: false } }
          }
        }
      }
    });

    if (user == null) return null;

    const request = await dbClient.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, recipientId: toBuffer(meId) },
          { senderId: toBuffer(meId), recipientId: user.id }
        ]
      }
    });

    // prettier-ignore
    const friendStatus: FriendStatus =
        request == null ? FriendStatus.NotFriends
      : request.accepted ? FriendStatus.Friends
      : request.senderId.toString('hex') === user.id.toString('hex') ? FriendStatus.RequestWaiting
      : FriendStatus.RequestSent;

    return {
      id: toUint8Array(user.id),
      username: user.username,
      createdAt: user.createdAt,
      friendStatus,
      friends: user._count.friendRequests + user._count.sentFriendRequests,
      publicImages: user._count.uploadedImages,
      publicAlbums: user._count.createdAlbums
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
