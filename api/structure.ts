import { APISubmission } from './routes/submission';
import { APIFriend } from './routes/friend';
import { APIImage } from './routes/image';
import { APIAlbum } from './routes/album';
import { APIUser } from './routes/user';
import { APIB2 } from './routes/b2';

const API_STRUCTURE = [APIB2, APIUser, APIFriend, APIAlbum, APISubmission, APIImage] as const;

export { API_STRUCTURE };
