import { b2BaseDownloadUrl } from '../data/b2Client';
import { APIHandlers } from './index';

const APIB2Handlers: APIHandlers['b2'] = {
  getBaseDownloadUrl: async () => b2BaseDownloadUrl.current
};

export { APIB2Handlers };
