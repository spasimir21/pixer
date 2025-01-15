import { APIHandlers } from './APIHandlers';

const APIKeystoreHandlers: APIHandlers['keystore'] = {
  get: async input => {
    return null;
  },
  save: async (input, authenticationInfo) => {
    return false;
  },
  delete: async (input, authenticationInfo) => {
    return false;
  }
};

export { APIKeystoreHandlers };
