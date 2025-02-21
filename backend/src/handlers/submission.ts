import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { toBuffer, toUint8Array } from '../utils/buffer';
import { DeleteObjectCommand, DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { dbClient } from '../data/dbClient';
import { b2Client } from '../data/b2Client';
import { APIHandlers } from './index';

const APISubmissionHandlers: APIHandlers['submission'] = {
  create: async ({ imageDate, imageType, imageExt, albumId, imageSize, previewSize }, { userId }) => {
    const album = await dbClient.album.findFirst({
      where: {
        id: albumId,
        allowSubmissions: true
      }
    });

    if (album == null) return null;

    const submission = await dbClient.submission.create({
      data: {
        imageDate,
        imageType,
        imageExt,
        creatorId: toBuffer(userId),
        albumId
      },
      include: {
        creator: { select: { id: true, username: true } }
      }
    });

    const imageCommand = new PutObjectCommand({
      Bucket: 'pixer-images',
      Key: `${albumId}/${submission.id}`,
      ContentType: imageType,
      ContentLength: imageSize
    });

    const previewCommand = new PutObjectCommand({
      Bucket: 'image-previews',
      Key: `${albumId}/${submission.id}`,
      ContentType: 'image/png',
      ContentLength: previewSize
    });

    try {
      return {
        submission: {
          id: submission.id,
          uploadedAt: submission.createdAt,
          imageDate: submission.imageDate,
          imageType: submission.imageType,
          imageExt: submission.imageExt,
          creator: {
            id: toUint8Array(submission.creator.id),
            username: submission.creator.username
          },
          albumId
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
  acceptSubmission: async ({ submissionId }, { userId }) => {
    try {
      const submission = await dbClient.submission.delete({
        where: {
          id: submissionId,
          album: {
            OR: [{ creatorId: toBuffer(userId) }, { users: { some: { id: toBuffer(userId) } } }]
          }
        }
      });

      await dbClient.image.create({
        data: {
          ...submission,
          isSubmission: true,
          isEncrypted: false
        }
      });

      return true;
    } catch {
      return false;
    }
  },
  rejectSubmission: async ({ submissionId }, { userId }) => {
    try {
      const submission = await dbClient.submission.delete({
        where: {
          id: submissionId,
          OR: [
            { creatorId: toBuffer(userId) },
            {
              album: {
                OR: [{ creatorId: toBuffer(userId) }, { users: { some: { id: toBuffer(userId) } } }]
              }
            }
          ]
        }
      });

      await b2Client.send(
        new DeleteObjectCommand({
          Bucket: 'pixer-images',
          Key: `${submission.albumId}/${submission.id}`
        })
      );

      await b2Client.send(
        new DeleteObjectCommand({
          Bucket: 'image-previews',
          Key: `${submission.albumId}/${submission.id}`
        })
      );

      return true;
    } catch {
      return false;
    }
  },
  getSubmissions: async ({ albumId, skip }, { userId }) => {
    const submissions = await dbClient.submission.findMany({
      where: {
        albumId,
        OR: [
          { creatorId: toBuffer(userId) },
          {
            album: {
              OR: [{ creatorId: toBuffer(userId) }, { users: { some: { id: toBuffer(userId) } } }]
            }
          }
        ]
      },
      include: {
        creator: { select: { id: true, username: true } }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: 10
    });

    return submissions.map(submission => ({
      id: submission.id,
      uploadedAt: submission.createdAt,
      imageDate: submission.imageDate,
      imageType: submission.imageType,
      imageExt: submission.imageExt,
      creator: {
        id: toUint8Array(submission.creator.id),
        username: submission.creator.username
      },
      albumId
    }));
  }
};

export { APISubmissionHandlers };
