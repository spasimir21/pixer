import { OutletComponent, useNavigation, useRouting } from '@lib/router';
import { Component, useChildComponents } from '@lib/component';
import { LoadingComponent } from './components/Loading';
import { html, UINode } from '@lib/ui';
import { ROUTES } from './routes';

const AppComponent = Component((): UINode => {
  const [Outlet] = useChildComponents(OutletComponent);
  useRouting(ROUTES);

  const { goto, back, refresh } = useNavigation();

  return html`
    ${Outlet(LoadingComponent)}

    <br />
    <button @click=${() => goto({ route: 'user' })}>User</button>
    <button @click=${() => goto({ path: '/' })}>Home</button>
    <button @click=${back}>Back</button>
    <button @click=${refresh}>Refresh</button>
  `;
});

export { AppComponent };
