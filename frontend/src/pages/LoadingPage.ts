import { useLocalization } from '../service/LocalizationService';
import { Component } from '@lib/component';
import { useTitle } from '@lib/router';
import { html, UINode } from '@lib/ui';

const LoadingPageComponent = Component((): UINode => {
  const l = useLocalization();

  useTitle(() => l('pixer.title'));

  return html`
    <div class="fixed w-screen h-screen top-0 left-0 flex flex-col items-center justify-around">
      <div></div>
      <div class="flex flex-col gap-3 items-center">
        <div class="flex items-center gap-3">
          <img class="w-10" src="/assets/logo.png" />
          <h1 class="text-5xl font-bold">${l('pixer.title')}</h1>
        </div>
        <h3 class="text-xl text-gray-700 italic">${l('pixer.tagline')}</h3>
      </div>
      <p class="italic text-gray-600 text-lg cursor-pointer">${l('loading')}</p>
    </div>
  `;
});

export default LoadingPageComponent;
