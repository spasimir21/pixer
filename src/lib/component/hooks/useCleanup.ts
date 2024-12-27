import { getCurrentComponentContext } from '../ComponentContext';
import { addCleanup } from '@lib/reactivity';
import { useCallback } from './useCallback';

const useCleanup = (cleanup: () => void) => addCleanup(getCurrentComponentContext()!, useCallback(cleanup));

export { useCleanup };
