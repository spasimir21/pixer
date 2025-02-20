import { APISubmission } from './routes/submission';
import { APIFriend } from './routes/friend';
import { APIAlbum } from './routes/album';
import { APIUser } from './routes/user';

const API_STRUCTURE = [APIUser, APIFriend, APIAlbum, APISubmission] as const;

export { API_STRUCTURE };
