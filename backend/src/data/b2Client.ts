import { S3Client } from '@aws-sdk/client-s3';
import B2 from 'backblaze-b2';

const b2NativeClient = new B2({
  applicationKeyId: process.env.B2_KEY_ID as string,
  applicationKey: process.env.B2_APP_KEY as string
});

const b2BaseDownloadUrl = { current: '' };

const authorize = async () => {
  try {
    const res = await b2NativeClient.authorize();
    if (res?.data?.downloadUrl) b2BaseDownloadUrl.current = res.data.downloadUrl;
  } catch {}
};

authorize();
setInterval(authorize, 60 * 60 * 1000); // Runs every hour

const b2Client = new S3Client({
  region: 'eu-central-003',
  endpoint: 'https://s3.eu-central-003.backblazeb2.com',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID as string,
    secretAccessKey: process.env.B2_APP_KEY as string
  }
});

export { b2Client, b2BaseDownloadUrl };
