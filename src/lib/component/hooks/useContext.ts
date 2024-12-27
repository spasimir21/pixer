import { getCurrentComponentContext } from '../ComponentContext';
import { ValueNode } from '@lib/reactivity';
import { useState } from './useState';

function createContextValue<T>(name: string) {
  const contextSymbol = Symbol(name);

  return [
    (): ValueNode<T> => getCurrentComponentContext()!.contextValues.get(contextSymbol)!,
    (initialValue: T) => {
      const contextValue = useState(initialValue);
      getCurrentComponentContext()!.contextValues.set(contextSymbol, contextValue);
      return contextValue;
    }
  ] as const;
}

export { createContextValue };
