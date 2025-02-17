import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { toBuffer, toUint8Array } from '../utils/buffer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { dbClient } from '../data/dbClient';
import { b2Client } from '../data/b2Client';
import { AlbumType } from '@prisma/client';
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

      return { ...album, creatorId: toUint8Array(album.creatorId), users: options.users };
    } catch {
      return null;
    }
  },
  getAccessibleAlbumsInfo: async ({ includeUsers }, { userId }) => {
    const user = await dbClient.user.findFirst({
      where: {
        id: toBuffer(userId)
      },
      select: {
        createdAlbums: {
          include: {
            users: includeUsers
              ? {
                  select: { id: true }
                }
              : false
          }
        },
        sharedAlbums: {
          include: {
            users: includeUsers
              ? {
                  select: { id: true }
                }
              : false
          }
        },
        pinnedAlbums: {
          include: {
            users: includeUsers
              ? {
                  select: { id: true }
                }
              : false
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (user == null) return { own: [], shared: [], pinned: [] };

    return {
      own: user.createdAlbums.map(album => ({
        ...album,
        creatorId: toUint8Array(album.creatorId),
        users: album.users ? album.users.map(user => toUint8Array(user.id)) : null
      })),
      shared: user.sharedAlbums.map(album => ({
        ...album,
        creatorId: toUint8Array(album.creatorId),
        users: album.users ? album.users.map(user => toUint8Array(user.id)) : null
      })),
      pinned: user.pinnedAlbums.map(album => ({
        ...album,
        creatorId: toUint8Array(album.creatorId),
        users: album.users ? album.users.map(user => toUint8Array(user.id)) : null
      }))
    };
  },
  getAlbumInfo: async ({ albumId }, { userId }) => {
    const album = await dbClient.album.findFirst({
      where: {
        id: albumId,
        OR: [
          { type: AlbumType.PUBLIC },
          {
            type: AlbumType.PRIVATE,
            OR: [{ creatorId: toBuffer(userId) }, { users: { some: { id: toBuffer(userId) } } }]
          }
        ]
      },
      include: {
        users: { select: { id: true } }
      }
    });

    if (album == null) return null;

    return {
      ...album,
      creatorId: toUint8Array(album.creatorId),
      users: album.users.map(user => toUint8Array(user.id))
    };
  },
  pinAlbum: async ({ albumId }, { userId }) => {
    const result = await dbClient.user.update({
      where: { id: toBuffer(userId) },
      include: { pinnedAlbums: { select: { id: true } } },
      data: {
        pinnedAlbums: {
          connect: {
            id: albumId,
            creatorId: { not: toBuffer(userId) },
            type: AlbumType.PUBLIC
          }
        }
      }
    });

    return result.pinnedAlbums.some(album => album.id === albumId);
  },
  unpinAlbum: async ({ albumId }, { userId }) => {
    const result = await dbClient.user.update({
      where: { id: toBuffer(userId) },
      include: { pinnedAlbums: { select: { id: true } } },
      data: { pinnedAlbums: { disconnect: { id: albumId } } }
    });

    return !result.pinnedAlbums.some(album => album.id === albumId);
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
      Bucket: 'album-covers',
      Key: `${albumId}`,
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
