import { useCallback } from './useCallback';
import { useCleanup } from './useCleanup';

function useInterval(callback: () => any, ms: number) {
  const interval = setInterval(useCallback(callback), ms);
  useCleanup(() => clearInterval(interval));
  return interval;
}

export { useInterval };
