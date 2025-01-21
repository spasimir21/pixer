import mongoose from 'mongoose';

const User = mongoose.model(
  'User',
  new mongoose.Schema({
    id: { type: Buffer, required: true, index: { unique: true } },
    username: { type: String, required: true, index: { unique: true } },
    publicKeys: {
      type: {
        identityKey: { type: Buffer, required: true, index: { unique: true } },
        encryptionKey: { type: Buffer, required: true }
      },
      required: true
    },
    encryptedKeys: {
      type: {
        passwordSalt: { type: Buffer, required: true },
        identityKey: { type: Buffer, required: true },
        identityKeyIv: { type: Buffer, required: true },
        encryptionKey: { type: Buffer, required: true },
        encryptionKeyIv: { type: Buffer, required: true }
      },
      required: true
    }
  })
);

export { User };
