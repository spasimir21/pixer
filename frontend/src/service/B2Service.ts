import { createSingletonManager, Service } from '@lib/service';
import { id } from '@lib/utils/id';

class B2Service extends Service {
  public profileIconTemp: string = id();

  constructor(public readonly b2Origin: string) {
    super();
  }

  profileIcon(hexId: string) {
    return `https://profile-icons.${this.b2Origin}/${hexId}?temp=${this.profileIconTemp}`;
  }

  invalidateProfileIcons() {
    this.profileIconTemp = id();
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
