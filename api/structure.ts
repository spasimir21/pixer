import { APIKeystore } from './routes/keystore';
import { APIUser } from './routes/user';

const API_STRUCTURE = [APIUser, APIKeystore] as const;

export { API_STRUCTURE };
