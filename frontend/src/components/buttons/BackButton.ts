import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Component, useChildComponents } from '@lib/component';
import { useNavigation, useRoute } from '@lib/router';
import { IconComponent } from '../Icon';
import { html, UINode } from '@lib/ui';

const BackButtonComponent = Component((): UINode => {
  const [Icon] = useChildComponents(IconComponent);

  const { navigate } = useNavigation();
  const route = useRoute();

  const goBack = () => {
    if ($route.search.has('referer')) navigate($route.search.get('referer')!);
    else navigate({ route: 'home' });
  };

  return html`
    <div class="w-9 h-9 grid place-items-center" @click=${goBack}>
      ${Icon({
        icon: faArrowLeft,
        fill: 'black',
        classes: 'w-6'
      })}
    </div>
  `;
});

export { BackButtonComponent };
