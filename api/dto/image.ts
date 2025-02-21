import { _const, boolean, buffer, date, DTOType, int, nullable, object, string, uuidV4 } from '@lib/dto';
import { CRYPTO_CONSTANTS } from '../cryptoConstants';
import { user, userInfo } from './user';
import { albumInfo } from './album';

const imageKey = object({
  userId: user.id,
  encryptedKey: buffer({ length: _const(CRYPTO_CONSTANTS.encryption.encryptedKeyLength) }),
  encryptedIv: buffer({ length: _const(CRYPTO_CONSTANTS.encryption.encryptedIvLength) })
});

type ImageKey = DTOType<typeof imageKey>;

const image = object({
  id: uuidV4(),
  uploadedAt: date(),
  imageDate: date(),
  imageType: string({ length: int({ max: 128 }) }),
  imageExt: string({ length: int({ max: 12 }) }),
  creator: userInfo,
  albumId: albumInfo.id,
  wasSubmission: boolean(),
  isEncrypted: boolean(),
  key: nullable(imageKey)
});

type Image = DTOType<typeof image>;

export { Image, image, ImageKey, imageKey };
