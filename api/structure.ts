import { APISubmission } from './routes/submission';
import { APIFriend } from './routes/friend';
import { APIAlbum } from './routes/album';
import { APIUser } from './routes/user';
import { APIB2 } from './routes/b2';

const API_STRUCTURE = [APIB2, APIUser, APIFriend, APIAlbum, APISubmission] as const;

export { API_STRUCTURE };
