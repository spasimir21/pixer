import { IServiceHandle, IServiceManager } from './manager/IServiceManager';
import { useCleanup, useEffect, useState } from '@lib/component';
import { runWithoutTracking, StateNode } from '@lib/reactivity';
import { Service } from './Service';

function useService$<T extends Service>(manager: IServiceManager<T, []>): StateNode<T>;
function useService$<T extends Service, TArgs extends any[]>(
  manager: IServiceManager<T, TArgs>,
  getArgs: () => TArgs
): StateNode<T>;
function useService$(manager: IServiceManager<any, any>, getArgs?: () => any[]) {
  const service = useState(null as any);

  useEffect(() => {
    const args = getArgs ? getArgs() : [];

    let handle: IServiceHandle<any>;
    runWithoutTracking(() => {
      handle = manager.get(...args);
      $service = handle.service;
    });

    return () => handle.release();
  });

  return service;
}

function useService<T extends Service>(manager: IServiceManager<T, []>): T;
function useService<T extends Service, TArgs extends any[]>(
  manager: IServiceManager<T, TArgs>,
  getArgs: () => TArgs
): T;
function useService(manager: IServiceManager<any, any>, getArgs?: () => any[]) {
  const handle = manager.get(...(getArgs ? getArgs() : []));

  useCleanup(() => handle.release());

  return handle.service;
}

export { useService, useService$ };
