import { useCallback } from './useCallback';
import { Component } from '../Component';

const useChildComponents = <T extends Component<any>[]>(
  ...components: T
): {
  [K in keyof T]: T[K]['create'];
} => components.map(component => useCallback(component.create)) as any;

export { useChildComponents };
