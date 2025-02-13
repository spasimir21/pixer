import { toBuffer, toUint8Array } from '../utils/buffer';
import { dbClient } from '../data/dbClient';
import { APIHandlers } from './index';

const APIFriendHandlers: APIHandlers['friend'] = {
  sendRequest: async ({ to }, { userId }) => {
    const existingRequest = await dbClient.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: toBuffer(to), recipientId: toBuffer(userId) },
          { senderId: toBuffer(userId), recipientId: toBuffer(to) }
        ]
      }
    });

    if (existingRequest != null) return false;

    const request = await dbClient.friendRequest.create({
      data: {
        senderId: toBuffer(userId),
        recipientId: toBuffer(to)
      }
    });

    return request != null;
  },
  cancelRequest: async ({ to }, { userId }) => {
    try {
      await dbClient.friendRequest.delete({
        where: { senderId_recipientId: { senderId: toBuffer(userId), recipientId: toBuffer(to) } }
      });

      return true;
    } catch {
      return false;
    }
  },
  acceptRequest: async ({ from }, { userId }) => {
    const result = await dbClient.friendRequest.update({
      where: { senderId_recipientId: { senderId: toBuffer(from), recipientId: toBuffer(userId) }, accepted: false },
      data: { accepted: true }
    });

    return result != null;
  },
  rejectRequest: async ({ from }, { userId }) => {
    try {
      await dbClient.friendRequest.delete({
        where: { senderId_recipientId: { senderId: toBuffer(from), recipientId: toBuffer(userId) } }
      });

      return true;
    } catch {
      return false;
    }
  },
  getRequests: async ({}, { userId }) => {
    const outgoingRequests = await dbClient.friendRequest.findMany({
      where: { senderId: toBuffer(userId), accepted: false },
      include: {
        recipient: {
          select: { id: true, username: true }
        }
      }
    });

    const incomingRequests = await dbClient.friendRequest.findMany({
      where: { recipientId: toBuffer(userId), accepted: false },
      include: {
        sender: {
          select: { id: true, username: true }
        }
      }
    });

    return {
      outgoing: outgoingRequests.map(req => ({
        createdAt: req.createdAt,
        userId: toUint8Array(req.recipient.id),
        username: req.recipient.username
      })),
      incoming: incomingRequests.map(req => ({
        createdAt: req.createdAt,
        userId: toUint8Array(req.sender.id),
        username: req.sender.username
      }))
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
    try {
      await dbClient.friendRequest.delete({
        where: {
          senderId_recipientId: { senderId: toBuffer(userId), recipientId: toBuffer(meId) },
          accepted: true
        }
      });

      return true;
    } catch {}

    try {
      await dbClient.friendRequest.delete({
        where: {
          senderId_recipientId: { senderId: toBuffer(meId), recipientId: toBuffer(userId) },
          accepted: true
        }
      });

      return true;
    } catch {}

    // TODO: Remove from shared albums

    return false;
  }
};

export { APIFriendHandlers };
