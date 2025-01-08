import { IServiceManager } from './IServiceManager';
import { cleanup } from '@lib/reactivity';

type SingletonInstances<T> = Record<
  string,
  {
    service: T;
    handleCount: number;
  }
>;

function createSingletonManager<T, TArgs extends any[]>(
  getService: (...args: TArgs) => T,
  getKey: (...args: TArgs) => string,
  shouldCleanup: boolean
): IServiceManager<T, TArgs> {
  const instancesSymbol = Symbol();

  return {
    get(root, ...args) {
      if (!(instancesSymbol in root)) root[instancesSymbol] = {};
      const instances: SingletonInstances<T> = root[instancesSymbol];

      const key = getKey(...args);

      if (!(key in instances))
        instances[key] = {
          service: getService(...args),
          handleCount: 0
        };

      const instance = instances[key];

      instance.handleCount++;

      return {
        service: instance.service,
        isReleased: false,
        release() {
          if (this.isReleased) return;
          this.isReleased = true;

          instance.handleCount--;

          if (instance.handleCount > 0 || !shouldCleanup) return;

          cleanup(instance.service);
          delete instances[key];
        }
      };
    }
  };
}

export { createSingletonManager };
