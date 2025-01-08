import { IServiceManager } from './IServiceManager';
import { cleanup } from '@lib/reactivity';

const createInstanceManager = <T, TArgs extends any[]>(
  getService: (...args: TArgs) => T
): IServiceManager<T, TArgs> => ({
  get(_root, ...args) {
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
