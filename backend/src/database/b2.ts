import { S3Client } from '@aws-sdk/client-s3';

const b2Client = new S3Client({
  region: 'eu-central-003',
  endpoint: 'https://s3.eu-central-003.backblazeb2.com',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID as string,
    secretAccessKey: process.env.B2_APP_KEY as string
  }
});

export { b2Client };
