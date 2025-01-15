import { useDependency } from './useDependency';
import { computed } from '@lib/reactivity';

const useComputed = <T>(getter: () => T) => useDependency(computed(getter));

export { useComputed };
