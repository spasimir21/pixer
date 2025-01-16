import { APIHandlers } from './index';

const APIUserHandlers: APIHandlers['user'] = {
  create: async (input, auth) => {
    return {
      id: auth.userId,
      username: input.username,
      publicKey: auth.publicKeyBuffer
    };
  },
  get: async input => {
    return null;
  }
};

export { APIUserHandlers };
