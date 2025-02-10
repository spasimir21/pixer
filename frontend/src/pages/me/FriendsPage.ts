import { ProfileButtonComponent } from '../../components/buttons/ProfileButton';
import { ProfileIconComponent } from '../../components/ProfileIcon/ProfileIcon';
import { Component, useChildComponents, useState } from '@lib/component';
import { AuthenticatedRoute } from '../../components/AuthenticatedRoute';
import { useLocalization } from '../../service/LocalizationService';
import { APIServiceManager } from '../../service/APIService';
import { HeaderComponent } from '../../components/Header';
import { useNavigation, useTitle } from '@lib/router';
import { IconComponent } from '../../components/Icon';
import { Friend } from '@api/dto/friendRequest';
import { requests } from '../../api/requests';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { faCross, faMinus, faUserMinus, faXmark } from '@fortawesome/free-solid-svg-icons';

const FriendsPageComponent = Component((): UINode => {
  const [Header, ProfileIcon, Icon, ProfileButton] = useChildComponents(
    HeaderComponent,
    ProfileIconComponent,
    IconComponent,
    ProfileButtonComponent
  );

  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();

  useTitle(() => `${l('pixer.title')} - ${l('me.friends.title')}`);

  const friends = useState<Friend[] | null>(null);

  apiService.send(requests.user.getFriends, {}).then(response => {
    if (response.error) {
      navigate({ route: 'home' });
      return;
    }

    $friends = response.result;
  });

  const isRemoving = useState(false);

  const removeFriend = async (friend: Friend) => {
    if ($isRemoving) return;
    $isRemoving = true;

    const response = await apiService.send(requests.user.unfriend, { userId: friend.id });

    if (response.error == null && response.result === true) $friends!.splice($friends!.indexOf(friend), 1);

    $isRemoving = false;
  };

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: ProfileButton,
        title: () => l('me.friends.title')
      })}

      <div class="flex-grow flex flex-col w-full max-w-[430px]">
        <if ${$friends == null}>
          <p class="text-gray-700 text-lg text-center mt-4">${l('loading')}</p>
        </if>
        <else-if ${$friends?.length === 0}>
          <p class="text-gray-700 text-lg text-center mt-4">${l('me.friends.noFriends')}</p>
        </else-if>
        <else>
          <each ${$friends}>
            ${(friend: Friend) => html`
              <div
                class="flex items-center py-3 px-3 border-b-2 border-gray-200 justify-between"
                @click=${() => navigate({ route: 'user', params: { username: friend.username } })}>
                <div class="flex items-center gap-4">
                  ${ProfileIcon({
                    userId: () => friend.id,
                    classes: 'w-9'
                  })}

                  <p class="text-gray-700 text-xl font-bold">${friend.username}</p>
                </div>

                <div
                  class="flex px-3 py-1 gap-2 items-center rounded-lg bg-red-500 text-white font-bold"
                  @click:stopPropagation=${() => removeFriend(friend)}>
                  ${Icon({ icon: faUserMinus, fill: 'white', classes: 'w-4' })} ${l('me.friends.remove')}
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

export default AuthenticatedRoute(FriendsPageComponent);
