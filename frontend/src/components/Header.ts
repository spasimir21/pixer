import { Component } from '@lib/component';
import { html, UINode } from '@lib/ui';

const HeaderComponent = Component(
  ({ left, title, right }: { left?: () => UINode; title?: () => string; right?: () => UINode }): UINode => html`
    <div class="w-screen h-14 bg-gray-100 relative top-0 left-0 shadow-md px-3 flex items-center justify-between">
      <div class="w-9">${left ? left() : null}</div>

      <p class="font-bold text-gray-800 text-xl">${title ? title() : null}</p>

      <div class="w-9">${right ? right() : null}</div>
    </div>
  `
);

export { HeaderComponent };
