import { getCurrentComponentContext, popComponentContext, pushComponentContext } from '../ComponentContext';

function useCallback<T extends (...args: any) => any>(callback: T): T {
  const context = getCurrentComponentContext();
  if (context == null) return callback;

  return ((...args) => {
    pushComponentContext(context);
    const result = callback(...args);
    popComponentContext();
    return result;
  }) as T;
}

export { useCallback };
