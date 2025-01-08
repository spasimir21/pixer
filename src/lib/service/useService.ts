import { IServiceHandle, IServiceManager } from './manager/IServiceManager';
import { createContextValue, useEffect, useState } from '@lib/component';
import { runWithoutTracking } from '@lib/reactivity';

const [useServicesRoot, _useProvideServicesRoot] = createContextValue<any>('servicesRoot');

function useService<T, TArgs extends any[]>(manager: IServiceManager<T, TArgs>, getArgs: () => TArgs) {
  const root = useServicesRoot();

  const service = useState<T>(null as any);

  useEffect(() => {
    const args = getArgs();

    let handle: IServiceHandle<T>;
    runWithoutTracking(() => {
      handle = manager.get($root, ...args);
      $service = handle.service;
    });

    return () => handle.release();
  });

  return service;
}

const useProvideServicesRoot = () => _useProvideServicesRoot(() => ({}));

export { useService, useProvideServicesRoot };
