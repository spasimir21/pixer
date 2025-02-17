import { faArrowLeft, faPen, faPlus, faPlusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { Component, useChildComponents } from '@lib/component';
import { useNavigation, useRoute } from '@lib/router';
import { IconComponent } from '../Icon';
import { html, UINode } from '@lib/ui';

const EditAlbumButtonComponent = Component((): UINode => {
  const [Icon] = useChildComponents(IconComponent);

  const { navigate } = useNavigation();
  const route = useRoute();

  return html`
    <div
      class="w-9 h-9 grid place-items-center cursor-pointer"
      @click=${() => navigate({ route: 'album.view.edit', params: $route.params })}>
      ${Icon({
        icon: faPen,
        fill: '#374151',
        classes: 'w-6'
      })}
    </div>
  `;
});

export { EditAlbumButtonComponent };
