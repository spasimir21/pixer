import { APIFriendRequests } from './routes/friendRequests';
import { APIAlbum } from './routes/album';
import { APIUser } from './routes/user';

const API_STRUCTURE = [APIUser, APIFriendRequests, APIAlbum] as const;

export { API_STRUCTURE };
