import { FlatRouteDefinition, flattenRouteDefinitions, RouteComponent, RouteDefinition } from './routes';
import { createContextValue, useCleanup, useEffect } from '@lib/component';

interface Route {
  name: string;
  path: string;
  search: URLSearchParams;
  hash: string;
  params: Record<string, string>;
  title: string | null;
  components: RouteComponent[];
  forcedRefresh: boolean;
}

const [useRoute, useProvideRoute] = createContextValue<Route>('route');

type GotoLocation =
  | string
  | (({} | { path: string } | { route: string; params?: any }) & { hash?: string; search?: any });

interface Navigation {
  goto: (location: GotoLocation) => void;
  back: () => void;
  refresh: () => void;
}

const [_useNavigation, useProvideNavigation] = createContextValue<Navigation>('navigation');

const useNavigation = () => _useNavigation().value;

function matchRoute(routes: FlatRouteDefinition[], forcedRefresh: boolean = false): Route {
  const path = window.location.pathname;

  let routeDefinition: FlatRouteDefinition | null = null;
  let match: RegExpMatchArray | null = null;

  for (const route of routes) {
    match = path.match(route.pathRegexp);
    if (match == null) continue;

    routeDefinition = route;
    break;
  }

  const params = match?.groups ?? {};

  // prettier-ignore
  const title = 
      routeDefinition == null ? null
    : typeof routeDefinition.title === 'function' ? routeDefinition.title(params)
    : routeDefinition.title ?? null

  return {
    name: routeDefinition?.name ?? '',
    path,
    search: new URLSearchParams(location.search),
    hash: location.hash.slice(1),
    params,
    title,
    components: routeDefinition?.components ?? [],
    forcedRefresh
  };
}

function insertPathParams(path: string, params: any) {
  path = path.replace(/\*\*?/g, '');
  for (const key in params) path = path.replace(new RegExp(`\[?\[${key}\]\]?`, 'g'), params[key]);
  return path;
}

function useRouting(routes: RouteDefinition[]) {
  const flatRoutes = flattenRouteDefinitions(routes);

  const flatRoutesByName = Object.fromEntries(flatRoutes.map(route => [route.name, route]));

  const route = useProvideRoute(() => matchRoute(flatRoutes));

  const updateRoute = () => ($route = matchRoute(flatRoutes));

  useProvideNavigation(() => ({
    goto: location => {
      if (typeof location === 'string') {
        history.pushState(null, '', location);
        updateRoute();
        return;
      }

      // prettier-ignore
      let path =
          'path' in location ? location.path
        : 'route' in location ? insertPathParams(flatRoutesByName[location.route].path, location.params ?? {})
        : window.location.pathname;

      path +=
        location.search != null
          ? (location.search instanceof URLSearchParams
              ? location.search
              : new URLSearchParams(location.search)
            ).toString()
          : window.location.search;

      path += location.hash != null ? `#${location.hash}` : window.location.hash;

      history.pushState(null, '', path);
      updateRoute();
    },
    back: () => window.history.back(),
    refresh: () => ($route = matchRoute(flatRoutes, true))
  }));

  useEffect(() => {
    if ($route.title != null) document.title = $route.title as string;
  });

  window.addEventListener('popstate', updateRoute);

  useCleanup(() => window.removeEventListener('popstate', updateRoute));
}

export { useRouting, Route, useRoute, Navigation, useNavigation, GotoLocation };
