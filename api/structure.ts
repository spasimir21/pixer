import { APIFriendRequests } from './routes/friendRequests';
import { APIUser } from './routes/user';

const API_STRUCTURE = [APIUser, APIFriendRequests] as const;

export { API_STRUCTURE };
