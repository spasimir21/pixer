import { IServiceManager } from './IServiceManager';
import { cleanup } from '@lib/reactivity';
import { Service } from '../Service';

const createInstanceManager = <T extends Service, TArgs extends any[]>(
  getService: (...args: TArgs) => T
): IServiceManager<T, TArgs> => ({
  get(...args) {
    return {
      service: getService(...args),
      isReleased: false,
      release() {
        if (this.isReleased) return;
        this.isReleased = true;

        cleanup(this.service);
      }
    };
  }
});

export { createInstanceManager };
