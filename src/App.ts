import { Component, useChildComponents } from '@lib/component';
import { OutletComponent, useRouting } from '@lib/router';
import { LoadingComponent } from './components/Loading';
import { useProvideServicesRoot } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { ROUTES } from './routes';

const AppComponent = Component((): UINode => {
  const [Outlet] = useChildComponents(OutletComponent);

  useProvideServicesRoot();
  useRouting(ROUTES);

  return html` ${Outlet(LoadingComponent)} `;
});

export { AppComponent };
