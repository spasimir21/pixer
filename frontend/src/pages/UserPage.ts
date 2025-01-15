import { UserServiceManager } from '../service/UserService';
import { useNavigation, useRoute } from '@lib/router';
import { Component } from '@lib/component';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const UserPageComponent = Component((): UINode => {
  const { goto } = useNavigation();
  const route = useRoute();

  const userService = useService(UserServiceManager, () => [$route.params.id]);

  return html`
    <span>${$userService.id}</span>
    <br />
    <button @click=${() => goto({ route: 'user', params: { id: Math.random().toString(36).slice(2) } })}>Random</button>
  `;
});

export { UserPageComponent };
