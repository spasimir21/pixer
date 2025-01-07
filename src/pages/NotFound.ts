import { Component, useChildComponents, useCleanup } from '@lib/component';
import { OutletComponent, useNavigation } from '@lib/router';
import { html, UINode } from '@lib/ui';

const NotFoundComponent = Component((): UINode => {
  const [Outlet] = useChildComponents(OutletComponent);
  const { goto } = useNavigation();

  useCleanup(() => console.log('Not found cleanup'));

  return html`Not Found!`;
});

export { NotFoundComponent };
