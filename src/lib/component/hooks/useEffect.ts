import { effect, EffectCallback } from '@lib/reactivity';
import { useDependency } from './useDependency';
import { useCallback } from './useCallback';

const useEffect = (callback: EffectCallback) => useDependency(effect(useCallback(callback)));

export { useEffect };
