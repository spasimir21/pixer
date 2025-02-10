import { deepToBuffer, toBuffer, toUint8Array } from '../utils/buffer';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UserWithEncryptedKeys } from '@api/dto/user';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { FriendStatus } from '@api/dto/userStats';
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
        id: toBuffer(user.id),
        username: user.username,
        identityKey: toBuffer(user.publicKeys.identityKey),
        encryptionKey: toBuffer(user.publicKeys.encryptionKey),
        encryptedKeys: { create: deepToBuffer(user.encryptedKeys) }
      }
    });

    return user;
  },
  get: async ({ userId, username, includeEncryptedKeys }) => {
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
  getOwnStats: async ({}, { userId }) => {
    const [user, requests] = await dbClient.$transaction([
      dbClient.user.findFirst({
        where: { id: toBuffer(userId) },
        select: {
          createdAt: true,
          _count: {
            select: {
              friendRequests: { where: { accepted: true } },
              sentFriendRequests: { where: { accepted: true } }
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
      uploadedImages: 0,
      createdAlbums: 0
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
            sentFriendRequests: { where: { accepted: true } }
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
        request == null ? 'not-friends'
      : request.accepted ? 'friends'
      : request.senderId.toString('hex') === user.id.toString('hex') ? 'request-waiting'
      : 'request-sent';

    return {
      id: toUint8Array(user.id),
      username: user.username,
      createdAt: user.createdAt,
      friendStatus,
      friends: user._count.friendRequests + user._count.sentFriendRequests,
      uploadedImages: 0,
      createdAlbums: 0
    };
  },
  getFriends: async ({}, { userId }) => {
    const friendRequests = await dbClient.friendRequest.findMany({
      where: {
        recipientId: toBuffer(userId),
        accepted: true
      },
      include: {
        sender: {
          select: { id: true, username: true }
        }
      }
    });

    const sentFriendRequests = await dbClient.friendRequest.findMany({
      where: {
        senderId: toBuffer(userId),
        accepted: true
      },
      include: {
        recipient: {
          select: { id: true, username: true }
        }
      }
    });

    return [
      ...sentFriendRequests.map(req => ({ id: toUint8Array(req.recipient.id), username: req.recipient.username })),
      ...friendRequests.map(req => ({ id: toUint8Array(req.sender.id), username: req.sender.username }))
    ];
  },
  unfriend: async ({ userId }, { userId: meId }) => {
    const [a, b] = await dbClient.$transaction([
      dbClient.friendRequest.delete({
        where: {
          senderId_recipientId: { senderId: toBuffer(userId), recipientId: toBuffer(meId) },
          accepted: true
        }
      }),
      dbClient.friendRequest.delete({
        where: {
          senderId_recipientId: { senderId: toBuffer(meId), recipientId: toBuffer(userId) },
          accepted: true
        }
      })
    ]);

    // TODO: Remove from shared albums

    return a != null || b != null;
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
