import { getCurrentComponentContext } from '../ComponentContext';
import { ValueNode } from '@lib/reactivity';
import { useState } from './useState';

function createContextValue<T>(name: string) {
  const contextSymbol = Symbol(name);

  return [
    (): ValueNode<T> => getCurrentComponentContext()!.contextValues.get(contextSymbol)!,
    (getter: (oldValue: T | null) => T) => {
      const contextValues = getCurrentComponentContext()!.contextValues;

      const contextValue = useState(getter(contextValues.get(contextSymbol)?.value));
      contextValues.set(contextSymbol, contextValue);
      return contextValue;
    }
  ] as const;
}

export { createContextValue };
