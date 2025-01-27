import { useNavigation } from '@lib/router';
import { Component } from '@lib/component';
import { html, UINode } from '@lib/ui';

const HomeButtonComponent = Component((): UINode => {
  const { navigate } = useNavigation();

  return html`
    <div class="w-9 h-9 grid place-items-center">
      <img src="/assets/logo.png" class="w-8 h-8 cursor-pointer" @click=${() => navigate({ route: 'home' })} />
    </div>
  `;
});

export { HomeButtonComponent };
