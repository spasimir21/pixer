import { ProfileButtonComponent } from '../../components/buttons/ProfileButton';
import { ProfileIconComponent } from '../../components/ProfileIcon/ProfileIcon';
import { Component, useChildComponents, useState } from '@lib/component';
import { AuthenticatedRoute } from '../../components/AuthenticatedRoute';
import { useLocalization } from '../../service/LocalizationService';
import { APIServiceManager } from '../../service/APIService';
import { HeaderComponent } from '../../components/Header';
import { useNavigation, useTitle } from '@lib/router';
import { IconComponent } from '../../components/Icon';
import { FriendRequest } from '@api/dto/friend';
import { requests } from '../../api/requests';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { faCross, faMinus, faUserMinus, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BackButtonComponent } from '../../components/buttons/BackButton';

const RequestsPageComponent = Component((): UINode => {
  const [Header, ProfileIcon, Icon, BackButton] = useChildComponents(
    HeaderComponent,
    ProfileIconComponent,
    IconComponent,
    BackButtonComponent
  );

  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();

  useTitle(() => `${l('pixer.title')} - ${l('me.requests.title')}`);

  const friendRequests = useState<FriendRequest[] | null>(null);

  apiService.send(requests.friend.getRequests, {}).then(response => {
    if (response.error) {
      navigate({ route: 'home' }, true);
      return;
    }

    $friendRequests = response.result.incoming;
  });

  const isDoingAction = useState(false);

  const acceptRequest = async (request: FriendRequest) => {
    if ($isDoingAction) return;
    $isDoingAction = true;

    const response = await apiService.send(requests.friend.acceptRequest, { from: request.userId });

    if (response.error == null && response.result === true)
      $friendRequests!.splice($friendRequests!.indexOf(request), 1);

    $isDoingAction = false;
  };

  const rejectRequest = async (request: FriendRequest) => {
    if ($isDoingAction) return;
    $isDoingAction = true;

    const response = await apiService.send(requests.friend.rejectRequest, { from: request.userId });

    if (response.error == null && response.result === true)
      $friendRequests!.splice($friendRequests!.indexOf(request), 1);

    $isDoingAction = false;
  };

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: BackButton,
        title: () => l('me.requests.title')
      })}

      <div class="flex-grow flex flex-col w-full max-w-[430px]">
        <if ${$friendRequests == null}>
          <p class="text-gray-400 text-lg text-center mt-4">${l('loading')}</p>
        </if>
        <else-if ${$friendRequests!.length === 0}>
          <p class="text-gray-400 text-lg text-center mt-4">${l('me.requests.noRequests')}</p>
        </else-if>
        <else>
          <each ${$friendRequests!}>
            ${(request: FriendRequest) => html`
              <div
                class="flex items-center py-3 px-3 border-b-2 border-gray-200 justify-between"
                @click=${() => navigate({ route: 'user', params: { username: request.username } })}>
                <div class="flex items-center gap-4">
                  ${ProfileIcon({
                    userId: () => request.userId,
                    classes: 'w-9 cursor-pointer'
                  })}

                  <p class="text-gray-700 text-xl font-bold cursor-pointer">${request.username}</p>
                </div>

                <div class="flex items-center gap-2">
                  <div
                    class="cursor-pointer w-9 h-9 grid place-items-center rounded-lg bg-red-500 text-white font-bold"
                    @click:stopPropagation=${() => rejectRequest(request)}>
                    ${Icon({ icon: faUserMinus, fill: 'white', classes: 'w-5' })}
                  </div>
                  <div
                    class="cursor-pointer w-9 h-9 grid place-items-center rounded-lg bg-green-500 text-white font-bold"
                    @click:stopPropagation=${() => acceptRequest(request)}>
                    ${Icon({ icon: faUserPlus, fill: 'white', classes: 'w-5' })}
                  </div>
                </div>
              </div>
            `}
          </each>
        </else>

        <div class="h-32"></div>
      </div>
    </div>
  `;
});

export default AuthenticatedRoute(RequestsPageComponent);
