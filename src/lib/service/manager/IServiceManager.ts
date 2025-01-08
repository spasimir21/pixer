interface IServiceHandle<T> {
  service: T;
  isReleased: boolean;
  release(): void;
}

interface IServiceManager<T, TArgs extends any[]> {
  get(root: any, ...args: TArgs): IServiceHandle<T>;
}

export { IServiceManager, IServiceHandle };
