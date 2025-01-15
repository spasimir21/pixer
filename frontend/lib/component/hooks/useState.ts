import { useDependency } from './useDependency';
import { state } from '@lib/reactivity';

const useState = <T>(defaultValue: T) => useDependency(state(defaultValue));

export { useState };
