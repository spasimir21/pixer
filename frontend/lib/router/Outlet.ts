import { Component, createContextValue, useCallback, useEffect, useState } from '@lib/component';
import { createReactiveCallback, getRaw } from '@lib/reactivity';
import { RouteComponent } from './routes';
import { useRoute } from './useRouting';
import { html, UINode } from '@lib/ui';

const [_, useProvideOutletDepth] = createContextValue<number>('outletDepth');

const OutletComponent = Component((loadingComponent?: () => UINode): UINode => {
  const route = useRoute();

  const component = useState<any>(loadingComponent ? loadingComponent() : null);

  const outletDepth = useProvideOutletDepth(depth => (depth == null ? 0 : depth + 1));

  let prevRouteComponent = null as any;

  useEffect(
    createReactiveCallback(
      () => $route,
      useCallback(() => {
        const routeComponent: RouteComponent | null = $route.components[$outletDepth];

        if (getRaw(routeComponent) === getRaw(prevRouteComponent) && !$route.forcedRefresh) return;
        prevRouteComponent = routeComponent;

        if (routeComponent == null) {
          $component = null;
          return;
        }

        if (typeof routeComponent !== 'function') {
          $component = routeComponent.create();
          return;
        }

        let shouldLoad = true;

        routeComponent().then(
          useCallback(loadedComponent => {
            if (!shouldLoad) return;
            $component = loadedComponent.create();
          })
        );

        return () => (shouldLoad = false);
      })
    )
  );

  return html`${$component}`;
});

export { OutletComponent };
