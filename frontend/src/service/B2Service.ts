import { createSingletonManager, Service } from '@lib/service';
import { APIService, APIServiceManager } from './APIService';
import { requests } from '../api/requests';
import { id } from '@lib/utils/id';

class B2Service extends Service {
  public profileIconTemp: string = id();
  public albumCoverTemp: string = id();
  public baseDownloadUrl: string = '';

  private readonly apiService: APIService;

  constructor(public readonly b2Origin: string) {
    super();

    this.apiService = this.useService(APIServiceManager);

    this.apiService.send(requests.b2.getBaseDownloadUrl, {}).then(response => {
      if (response.error) return;
      this.baseDownloadUrl = response.result;
    });
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

  async downloadAsBlob(bucket: string, key: string) {
    try {
      const res = await fetch(`${this.baseDownloadUrl}/file/${bucket}/${key}`);
      return res.blob();
    } catch {
      return null;
    }
  }

  async downloadAsArrayBuffer(bucket: string, key: string) {
    try {
      const res = await fetch(`${this.baseDownloadUrl}/file/${bucket}/${key}`);
      return res.arrayBuffer();
    } catch {
      return null;
    }
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
