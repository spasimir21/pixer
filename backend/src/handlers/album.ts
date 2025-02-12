import { dbClient } from '../data/dbClient';
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

      return album.id;
    } catch {
      return null;
    }
  }
};

export { APIAlbumHandlers };
