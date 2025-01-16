import { Component, useChildComponents } from '@lib/component';
import { OutletComponent, useRouting } from '@lib/router';
import { LoadingComponent } from './components/Loading';
import { html, UINode } from '@lib/ui';
import { ROUTES } from './routes';

const AppComponent = Component((): UINode => {
  const [Outlet] = useChildComponents(OutletComponent);

  useRouting(ROUTES);

  return html` ${Outlet(LoadingComponent)} `;
});

export { AppComponent };
