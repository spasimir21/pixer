import { getCurrentComponentContext } from '../ComponentContext';
import { addDependency } from '@lib/reactivity';

const useDependency = <T>(dependency: T) => addDependency(getCurrentComponentContext()!, dependency);

export { useDependency };
