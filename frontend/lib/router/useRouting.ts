import { FlatRouteDefinition, flattenRouteDefinitions, RouteComponent, RouteDefinition } from './routes';
import { createContextValue, useCleanup, useEffect } from '@lib/component';

interface Route {
  name: string;
  path: string;
  search: URLSearchParams;
  hash: string;
  params: Record<string, string>;
  components: RouteComponent[];
  forcedRefresh: boolean;
}

const [useRoute, useProvideRoute] = createContextValue<Route>('route');

type NavigateLocation =
  | string
  | (({} | { path: string } | { route: string; params?: any }) & { hash?: string; search?: any });

interface Navigation {
  navigate: (location: NavigateLocation) => void;
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

  return {
    name: routeDefinition?.name ?? '',
    path,
    search: new URLSearchParams(location.search),
    hash: location.hash.slice(1),
    params,
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
    navigate: location => {
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

      let search =
        location.search != null
          ? (location.search instanceof URLSearchParams
              ? location.search
              : new URLSearchParams(location.search)
            ).toString()
          : window.location.search;

      if (search.length > 0 && !search.startsWith('?')) search = '?' + search;

      path += search;
      path += location.hash != null ? `#${location.hash}` : window.location.hash;

      history.pushState(null, '', path);
      updateRoute();
    },
    back: () => window.history.back(),
    refresh: () => ($route = matchRoute(flatRoutes, true))
  }));

  window.addEventListener('popstate', updateRoute);

  useCleanup(() => window.removeEventListener('popstate', updateRoute));
}

function useTitle(title: string | (() => string)) {
  if (typeof title === 'string') {
    document.title = title;
    return;
  }

  useEffect(() => {
    document.title = title();
  });
}

export { useRouting, Route, useRoute, useTitle, Navigation, useNavigation, NavigateLocation };
