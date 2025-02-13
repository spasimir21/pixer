import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { dbClient } from '../data/dbClient';
import { b2Client } from '../data/b2Client';
import { AlbumType } from '@prisma/client';
import { toBuffer } from '../utils/buffer';
import { toHex } from '@lib/utils/hex';
import { APIHandlers } from './index';

const APIAlbumHandlers: APIHandlers['album'] = {
  create: async (options, { userId }) => {
    if (options.type === AlbumType.PRIVATE && options.allowSubmissions) return null;
    if (options.users.map(toHex).includes(toHex(userId))) return null;

    try {
      const album = await dbClient.album.create({
        data: {
          creatorId: toBuffer(userId),
          name: options.name,
          type: options.type,
          allowSubmissions: options.allowSubmissions,
          users: {
            connect: options.users.map(id => ({ id: toBuffer(id) }))
          }
        }
      });

      return { id: album.id };
    } catch {
      return null;
    }
  },
  uploadAlbumCover: async ({ albumId, fileSize }, { userId }) => {
    const album = await dbClient.album.findFirst({
      where: {
        id: albumId,
        creatorId: toBuffer(userId)
      }
    });

    if (album == null) return null;

    const coverCommand = new PutObjectCommand({
      Bucket: 'profile-icons',
      Key: `album/${albumId}`,
      ContentType: 'image/png',
      ContentLength: fileSize
    });

    try {
      return {
        coverUploadUrl: await getSignedUrl(b2Client, coverCommand, { expiresIn: 60 })
      };
    } catch {
      return null;
    }
  }
};

export { APIAlbumHandlers };
