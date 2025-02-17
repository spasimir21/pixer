import { AlbumInfoWithUsers } from '@api/dto/album';
import { createContextValue } from '@lib/component';

const [useAlbum, provideAlbum] = createContextValue<AlbumInfoWithUsers | null>('album');

export { useAlbum, provideAlbum };
