import { Service } from '../Service';

interface IServiceHandle<T extends Service> {
  service: T;
  isReleased: boolean;
  release(): void;
}

interface IServiceManager<T extends Service, TArgs extends any[]> {
  get(...args: TArgs): IServiceHandle<T>;
}

export { IServiceManager, IServiceHandle };
