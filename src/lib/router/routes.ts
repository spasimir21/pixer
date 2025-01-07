import { Component } from '@lib/component';
import { UINode } from '@lib/ui';

type RouteComponent = Component<() => UINode> | (() => Promise<Component<() => UINode>>);

interface RouteDefinition {
  name: string;
  path?: string;
  title?: string | ((params: Record<string, string>) => string);
  component?: RouteComponent;
  children?: RouteDefinition[];
}

interface FlatRouteDefinition {
  name: string;
  path: string;
  title?: string | ((params: Record<string, string>) => string);
  pathRegexp: RegExp;
  components: RouteComponent[];
}

const pathToPathRegexp = (path: string) =>
  new RegExp(
    `^\\/?${path
      .replace(/(^\/)|(\/$)/g, '')
      .replace(/\//g, '\\/')
      .replace(/\*\*/g, '.+?')
      .replace(/\*/g, '[^/]+?')
      .replace(/\[\[(\w+?)\]\]/g, '(?<$1>.+?)')
      .replace(/\[(\w+?)\]/g, '(?<$1>[^/]+?)')}\\/?$`,
    'i'
  );

function joinPaths(pathA: string, pathB: string) {
  pathA = pathA.replace(/(^\/)|(\/$)/g, '');
  pathB = pathB.replace(/(^\/)|(\/$)/g, '');

  if (pathA.length === 0) return '/' + pathB;
  if (pathB.length === 0) return '/' + pathA;

  return `/${pathA}/${pathB}`;
}

const flattenRouteDefinition = (route: RouteDefinition): FlatRouteDefinition[] => [
  ...flattenRouteDefinitions(route.children ?? []).map(child => {
    const path = route.path ? joinPaths(route.path, child.path) : child.path;

    return {
      name: `${route.name}.${child.name}`,
      path,
      title: child.title ?? route.title,
      pathRegexp: pathToPathRegexp(path),
      components: route.component ? [route.component, ...child.components] : child.components
    };
  }),
  {
    name: route.name,
    path: route.path ?? '/',
    title: route.title,
    pathRegexp: pathToPathRegexp(route.path ?? '/'),
    components: route.component ? [route.component] : []
  }
];

const flattenRouteDefinitions = (routes: RouteDefinition[]): FlatRouteDefinition[] =>
  routes.map(flattenRouteDefinition).flat();

export { RouteDefinition, FlatRouteDefinition, RouteComponent, flattenRouteDefinition, flattenRouteDefinitions };
