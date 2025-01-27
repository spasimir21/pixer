import { AuthenticationServiceManager } from '../../service/AuthenticationService';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { Component, useChildComponents } from '@lib/component';
import { useNavigation } from '@lib/router';
import { useService } from '@lib/service';
import { IconComponent } from '../Icon';
import { html, UINode } from '@lib/ui';

const LogOutButtonComponent = Component((): UINode => {
  const [Icon] = useChildComponents(IconComponent);

  const authService = useService(AuthenticationServiceManager);
  const { navigate } = useNavigation();

  const logout = () => {
    authService.logOut();
    navigate({ route: 'auth.login' });
  };

  return html`
    <div class="w-9 grid place-items-center cursor-pointer" @click=${logout}>
      ${Icon({
        icon: faDoorOpen,
        fill: 'rgb(55 65 81)',
        classes: 'w-8'
      })}
    </div>
  `;
});

export { LogOutButtonComponent };
