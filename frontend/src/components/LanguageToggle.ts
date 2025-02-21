import { useLanguage } from '../service/LocalizationService';
import { Component } from '@lib/component';
import { html, UINode } from '@lib/ui';

const LanguageToggleComponent = Component((): UINode => {
  const language = useLanguage();

  return html`
    <img
      @click=${() => ($language = $language == 'en' ? 'bg' : 'en')}
      class="fixed bottom-3 right-3 rounded-full shadow-md object-cover w-12 h-12 cursor-pointer"
      src=${`/assets/flag/${$language === 'en' ? 'en.svg' : 'bg.svg'}`} />
  `;
});

export { LanguageToggleComponent };
