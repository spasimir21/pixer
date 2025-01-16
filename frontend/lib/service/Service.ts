import { IServiceManager } from './manager/IServiceManager';
import { addCleanup } from '@lib/reactivity';

class Service {
  protected useService<T extends Service, TArgs extends any[]>(manager: IServiceManager<T, TArgs>, ...args: TArgs) {
    const handle = manager.get(...args);

    addCleanup(this, () => handle.release());

    return handle.service;
  }
}

export { Service };
