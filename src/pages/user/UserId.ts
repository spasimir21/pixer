import { Component, useCleanup } from '@lib/component';
import { html, UINode } from '@lib/ui';
import { useRoute } from '@lib/router';

const UserIdComponent = Component((): UINode => {
  const route = useRoute();

  useCleanup(() => console.log('User id cleanup'));

  return html`${$route.params.id}`;
});

export { UserIdComponent };
