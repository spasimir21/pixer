import { useCallback } from './useCallback';
import { useCleanup } from './useCleanup';

function useTimeout(callback: () => any, ms: number) {
  const timeout = setTimeout(useCallback(callback), ms);
  useCleanup(() => clearTimeout(timeout));
  return timeout;
}

export { useTimeout };
