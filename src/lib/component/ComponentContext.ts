import { ValueNode } from '@lib/reactivity';
import { Stack } from '@lib/utils/Stack';

interface ComponentContext {
  contextValues: Map<symbol, ValueNode<any>>;
}

function createComponentContext(): ComponentContext {
  const parentContext = getCurrentComponentContext();
  if (parentContext == null) return { contextValues: new Map() };

  return { contextValues: new Map(parentContext.contextValues) };
}

const COMPONENT_CONTEXT_STACK = new Stack<ComponentContext>();

const pushComponentContext = (context = createComponentContext()) => COMPONENT_CONTEXT_STACK.push(context);

const popComponentContext = () => COMPONENT_CONTEXT_STACK.pop();

const getCurrentComponentContext = () => COMPONENT_CONTEXT_STACK.peek();

export {
  ComponentContext,
  createComponentContext,
  COMPONENT_CONTEXT_STACK,
  pushComponentContext,
  popComponentContext,
  getCurrentComponentContext
};
