import { popComponentContext, pushComponentContext } from './ComponentContext';
import { addDependency, TrackStack } from '@lib/reactivity';
import { UINode } from '@lib/ui';

interface Component<T extends (...args: any[]) => UINode> {
  create: T;
}

const Component = <T extends (...args: any[]) => UINode>(component: T): Component<T> => ({
  create: ((...args) => {
    TrackStack.pushTrackPause();
    pushComponentContext();
    const element = component(...args);
    const context = popComponentContext();
    addDependency(element, context);
    TrackStack.pop();

    return element;
  }) as T
});

export { Component };
