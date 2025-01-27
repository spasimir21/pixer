import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { ProfileIconComponent } from '../ProfileIcon/ProfileIcon';
import { Component, useChildComponents } from '@lib/component';
import { useNavigation } from '@lib/router';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const ProfileButtonComponent = Component((): UINode => {
  const [ProfileIcon] = useChildComponents(ProfileIconComponent);

  const authService = useService(AuthenticationServiceManager);
  const { navigate } = useNavigation();

  return html`
    <div class="w-9 h-9 cursor-pointer" @click=${() => navigate({ route: 'me.profile' })}>
      ${ProfileIcon({
        userId: () => authService.user?.id ?? null,
        invalidatable: true,
        classes: 'w-9 h-9'
      })}
    </div>
  `;
});

export { ProfileButtonComponent };
