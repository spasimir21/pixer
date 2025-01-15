import { APIKeystore } from './keystore';
import { APIUser } from './user';

const API_STRUCTURE = [APIUser, APIKeystore] as const;

export { API_STRUCTURE };
