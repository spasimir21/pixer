import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Component, useChildComponents } from '@lib/component';
import { useNavigation } from '@lib/router';
import { IconComponent } from '../Icon';
import { html, UINode } from '@lib/ui';

const BackButtonComponent = Component((): UINode => {
  const [Icon] = useChildComponents(IconComponent);

  const { navigate, back } = useNavigation();

  const goBack = () => {
    const prevLocation = (history.state?.prevLocation ?? null) as string | null;

    if (prevLocation == null || prevLocation.startsWith('/auth/')) navigate({ route: 'home' });
    else back();
  };

  return html`
    <div class="w-9 h-9 grid place-items-center cursor-pointer" @click=${goBack}>
      ${Icon({
        icon: faArrowLeft,
        fill: '#374151',
        classes: 'w-6'
      })}
    </div>
  `;
});

export { BackButtonComponent };
