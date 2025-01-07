import { Component, useChildComponents, useCleanup } from '@lib/component';
import { OutletComponent, useNavigation } from '@lib/router';
import { html, UINode } from '@lib/ui';

const UserComponent = Component((): UINode => {
  const [Outlet] = useChildComponents(OutletComponent);
  const { goto } = useNavigation();

  useCleanup(() => console.log('User cleanup'));

  return html`
    <span>User</span>

    <br />

    ${Outlet()}

    <br />

    <button @click=${() => goto({ route: 'user' })}>No Id</button>
    <button @click=${() => goto({ route: 'user.id', params: { id: Math.random().toString(36).slice(2) } })}>
      Random Id
    </button>

    <br />
  `;
});

export { UserComponent };
