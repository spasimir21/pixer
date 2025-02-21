import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { toBuffer, toUint8Array } from '../utils/buffer';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { dbClient } from '../data/dbClient';
import { b2Client } from '../data/b2Client';
import { APIHandlers } from './index';
import { AlbumType } from '@prisma/client';

const APIImageHandlers: APIHandlers['image'] = {
  create: async ({ imageDate, imageType, imageExt, keys, albumId, imageSize, previewSize }, { userId }) => {
    const album = await dbClient.album.findFirst({
      where: {
        id: albumId,
        OR: [{ creatorId: toBuffer(userId) }, { users: { some: { id: toBuffer(userId) } } }]
      }
    });

    if (album == null) return null;

    const image = await dbClient.image.create({
      data: {
        imageDate,
        imageType,
        imageExt,
        creatorId: toBuffer(userId),
        albumId,
        isSubmission: false,
        isEncrypted: keys != null,
        keys:
          keys != null
            ? {
                create: keys.map(key => ({
                  userId: toBuffer(key.userId),
                  encryptedKey: toBuffer(key.encryptedKey),
                  encryptedIv: toBuffer(key.encryptedIv)
                }))
              }
            : undefined
      },
      include: {
        creator: { select: { id: true, username: true } },
        keys: {
          where: { userId: toBuffer(userId) }
        }
      }
    });

    const imageCommand = new PutObjectCommand({
      Bucket: 'pixer-images',
      Key: `${albumId}/${image.id}`,
      ContentType: imageType,
      ContentLength: imageSize
    });

    const previewCommand = new PutObjectCommand({
      Bucket: 'image-previews',
      Key: `${albumId}/${image.id}`,
      ContentType: 'image/png',
      ContentLength: previewSize
    });

    try {
      return {
        image: {
          id: image.id,
          uploadedAt: image.createdAt,
          imageDate: image.imageDate,
          imageType: image.imageType,
          imageExt: image.imageExt,
          creator: {
            id: toUint8Array(image.creator.id),
            username: image.creator.username
          },
          albumId,
          wasSubmission: false,
          isEncrypted: image.isEncrypted,
          key:
            image.keys.length === 0
              ? null
              : {
                  userId: toUint8Array(image.keys[0].userId),
                  encryptedKey: toUint8Array(image.keys[0].encryptedKey),
                  encryptedIv: toUint8Array(image.keys[0].encryptedIv)
                }
        },
        uploadUrls: {
          imageUploadUrl: await getSignedUrl(b2Client, imageCommand, { expiresIn: 60 * 5 }), // 5m
          previewUploadUrl: await getSignedUrl(b2Client, previewCommand, { expiresIn: 60 })
        }
      };
    } catch {
      return null;
    }
  },
  deleteImage: async ({ imageId }, { userId }) => {
    const image = await dbClient.image.findFirst({
      where: {
        id: imageId,
        OR: [
          {
            album: { creatorId: toBuffer(userId) }
          },
          {
            creatorId: toBuffer(userId),
            album: {
              users: { some: { id: toBuffer(userId) } }
            }
          }
        ]
      }
    });

    if (image == null) return false;

    try {
      await dbClient.imageKey.deleteMany({
        where: { imageId }
      });

      await dbClient.image.delete({
        where: { id: imageId }
      });

      await b2Client.send(
        new DeleteObjectCommand({
          Bucket: 'pixer-images',
          Key: `${image.albumId}/${image.id}`
        })
      );

      await b2Client.send(
        new DeleteObjectCommand({
          Bucket: 'image-previews',
          Key: `${image.albumId}/${image.id}`
        })
      );

      return true;
    } catch {
      return false;
    }
  },
  getImages: async ({ albumId, skip }, { userId }) => {
    const images = await dbClient.image.findMany({
      where: {
        albumId,
        album: {
          OR: [
            { type: AlbumType.PUBLIC },
            { creatorId: toBuffer(userId) },
            { users: { some: { id: toBuffer(userId) } } }
          ]
        }
      },
      include: {
        creator: { select: { id: true, username: true } },
        keys: { where: { userId: toBuffer(userId) } }
      },
      orderBy: {
        imageDate: 'desc'
      },
      skip,
      take: 10
    });

    return images.map(image => ({
      id: image.id,
      uploadedAt: image.createdAt,
      imageDate: image.imageDate,
      imageType: image.imageType,
      imageExt: image.imageExt,
      creator: {
        id: toUint8Array(image.creator.id),
        username: image.creator.username
      },
      albumId,
      wasSubmission: image.isSubmission,
      isEncrypted: image.isEncrypted,
      key:
        image.keys.length === 0
          ? null
          : {
              userId: toUint8Array(image.keys[0].userId),
              encryptedKey: toUint8Array(image.keys[0].encryptedKey),
              encryptedIv: toUint8Array(image.keys[0].encryptedIv)
            }
    }));
  }
};

export { APIImageHandlers };
