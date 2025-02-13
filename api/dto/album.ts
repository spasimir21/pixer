import { _enum, array, boolean, date, DTOType, nullable, object, string, uuidV4 } from '@lib/dto';
import { user } from './user';

const AlbumType = _enum('PRIVATE', 'PUBLIC');

type AlbumType = DTOType<typeof AlbumType>;

const albumInfoWithUsers = object({
  id: uuidV4(),
  createdAt: date(),
  creatorId: user.id,
  name: string(),
  type: AlbumType,
  allowSubmissions: boolean(),
  users: array({ of: user.id })
});

type AlbumInfoWithUsers = DTOType<typeof albumInfoWithUsers>;

const albumInfo = albumInfoWithUsers.with({
  users: nullable(albumInfoWithUsers.users)
});

type AlbumInfo = DTOType<typeof albumInfo>;

export { AlbumType, albumInfoWithUsers, AlbumInfoWithUsers, albumInfo, AlbumInfo };
