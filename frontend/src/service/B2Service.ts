import { createSingletonManager, Service } from '@lib/service';
import { id } from '@lib/utils/id';

class B2Service extends Service {
  public profileIconTemp: string = id();
  public albumCoverTemp: string = id();

  constructor(public readonly b2Origin: string) {
    super();
  }

  profileIcon(hexId: string, fullSize = false) {
    return `https://profile-icons.${this.b2Origin}/${fullSize ? 'full' : 'small'}/${hexId}?temp=${
      this.profileIconTemp
    }`;
  }

  albumCover(id: string) {
    return `https://album-covers.${this.b2Origin}/${id}?temp=${this.albumCoverTemp}`;
  }

  imagePreview(albumId: string, imageId: string) {
    return `https://image-previews.${this.b2Origin}/${albumId}/${imageId}`;
  }

  image(albumId: string, imageId: string) {
    return `https://pixer-images.${this.b2Origin}/${albumId}/${imageId}`;
  }

  invalidateProfileIcons() {
    this.profileIconTemp = id();
  }

  invalidateAlbumCovers() {
    this.albumCoverTemp = id();
  }

  async upload(signedUploadUrl: string, data: Blob) {
    try {
      await fetch(signedUploadUrl, {
        method: 'PUT',
        body: data
      });

      return true;
    } catch {
      return false;
    }
  }
}

const B2ServiceManager = createSingletonManager(() => new B2Service(import.meta.env.VITE_B2_ORIGIN), false);

export { B2Service, B2ServiceManager };
