import { IServiceManager } from './IServiceManager';
import { cleanup } from '@lib/reactivity';
import { Service } from '../Service';

type SingletonInstances<T extends Service> = Record<
  string,
  {
    service: T;
    handleCount: number;
  }
>;

function createSingletonManagerInternal<T extends Service, TArgs extends any[]>(
  getService: (...args: TArgs) => T,
  getKey: (...args: TArgs) => string,
  shouldCleanup: boolean
): IServiceManager<T, TArgs> {
  const instances: SingletonInstances<T> = {};

  return {
    get(...args) {
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

function createSingletonManager<T extends Service>(getService: () => T, shouldCleanup: boolean): IServiceManager<T, []>;
function createSingletonManager<T extends Service, TArgs extends any[]>(
  getService: (...args: TArgs) => T,
  getKey: (...args: TArgs) => string,
  shouldCleanup: boolean
): IServiceManager<T, TArgs>;
function createSingletonManager(
  getService: (...args: any[]) => any,
  getKeyOrShouldCleanup: ((...args: any[]) => string) | boolean,
  shouldCleanup?: boolean
): IServiceManager<any, any> {
  if (typeof getKeyOrShouldCleanup === 'boolean')
    return createSingletonManagerInternal(getService, () => '', getKeyOrShouldCleanup);

  return createSingletonManagerInternal(getService, getKeyOrShouldCleanup, shouldCleanup!);
}

export { createSingletonManager };
