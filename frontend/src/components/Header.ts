import { useNavigation } from '@lib/router';
import { Component } from '@lib/component';
import { html, UINode } from '@lib/ui';

const HeaderComponent = Component(({ title, button }: { title?: () => string; button?: () => UINode }): UINode => {
  const { navigate } = useNavigation();

  return html`
    <div class="w-screen h-14 bg-gray-100 relative top-0 left-0 shadow-md px-3 flex items-center justify-between">
      <div class="h-9 w-9 grid place-items-center">
        <img src="/assets/logo.png" alt="PiXer Logo" class="h-8" @click=${() => navigate({ route: 'home' })} />
      </div>

      <p class="font-bold text-gray-800 text-xl">${title ? title() : null}</p>

      <div class="w-9">${button ? button() : null}</div>
    </div>
  `;
});

export { HeaderComponent };
