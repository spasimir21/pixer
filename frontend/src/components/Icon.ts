import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { toValueNodes, Values } from '@lib/reactivity';
import { Component } from '@lib/component';
import { html, UINode } from '@lib/ui';

const IconComponent = Component((props: Values<{ icon: IconDefinition; fill?: string; classes?: string }>): UINode => {
  const { icon, fill, classes } = toValueNodes({
    icon: props.icon,
    fill: props.fill ?? null,
    classes: props.classes ?? null
  });

  return html`
    <svg class=${$classes ?? ''} viewBox=${`0 0 ${$icon.icon[0]} ${$icon.icon[1]}`} xmlns="http://www.w3.org/2000/svg">
      <path fill=${$fill ?? 'black'} d=${$icon.icon[4]} />
    </svg>
  `;
});

export { IconComponent };
