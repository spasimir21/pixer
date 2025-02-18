import { ProfileButtonComponent } from '../../components/buttons/ProfileButton';
import { ProfileIconComponent } from '../../components/ProfileIcon/ProfileIcon';
import { Component, useChildComponents, useState } from '@lib/component';
import { AuthenticatedRoute } from '../../components/AuthenticatedRoute';
import { useLocalization } from '../../service/LocalizationService';
import { APIServiceManager } from '../../service/APIService';
import { HeaderComponent } from '../../components/Header';
import { useNavigation, useTitle } from '@lib/router';
import { IconComponent } from '../../components/Icon';
import { UserInfo } from '@api/dto/user';
import { requests } from '../../api/requests';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { faCross, faMinus, faUserMinus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BackButtonComponent } from '../../components/buttons/BackButton';

const FriendsPageComponent = Component((): UINode => {
  const [Header, ProfileIcon, Icon, BackButton] = useChildComponents(
    HeaderComponent,
    ProfileIconComponent,
    IconComponent,
    BackButtonComponent
  );

  const apiService = useService(APIServiceManager);
  const { navigate } = useNavigation();
  const l = useLocalization();

  useTitle(() => `${l('pixer.title')} - ${l('me.friends.title')}`);

  const friends = useState<UserInfo[] | null>(null);

  apiService.send(requests.friend.getFriends, {}).then(response => {
    if (response.error) {
      navigate({ route: 'home' }, true);
      return;
    }

    $friends = response.result;
  });

  const dialogFriend = useState(null as UserInfo | null);
  const isRemoving = useState(false);

  const removeFriend = async (friend: UserInfo) => {
    if ($isRemoving) return;
    $isRemoving = true;

    const response = await apiService.send(requests.friend.unfriend, { userId: friend.id });

    if (response.error == null && response.result === true) $friends!.splice($friends!.indexOf(friend), 1);

    $isRemoving = false;
  };

  return html`
    <div class="w-screen h-screen top-0 left-0 fixed flex flex-col items-center">
      ${Header({
        left: BackButton,
        title: () => l('me.friends.title')
      })}

      <div
        @click=${() => ($dialogFriend = null)}
        .hidden=${$dialogFriend == null}
        class="p-5 fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-25 z-50 grid place-items-center">
        <div
          class="bg-white rounded-lg p-4 w-[80vw] max-w-[350px] flex flex-col gap-6"
          @click:stopPropagation=${() => {}}>
          <p class="text-xl">${l('me.friends.remove')} <span class="font-bold">"${$dialogFriend?.username}"</span>?</p>

          <div class="flex gap-4">
            <div
              class="cursor-pointer bg-red-500 rounded-lg text-lg text-white py-1 px-4 font-bold text-center"
              .opacity-75=${$isRemoving}
              @click=${() => removeFriend($dialogFriend!)}>
              ${l('me.friends.remove')}
            </div>

            <div
              @click=${() => ($dialogFriend = null)}
              class="cursor-pointer bg-gray-400 rounded-lg text-lg text-white py-1 px-4 font-bold text-center">
              ${l('me.friends.cancel')}
            </div>
          </div>
        </div>
      </div>

      <div class="flex-grow flex flex-col w-full max-w-[430px]">
        <if ${$friends == null}>
          <p class="text-gray-400 text-lg text-center mt-4">${l('loading')}</p>
        </if>
        <else-if ${$friends?.length === 0}>
          <p class="text-gray-400 text-lg text-center mt-4">${l('me.friends.noFriends')}</p>
        </else-if>
        <else>
          <each ${$friends}>
            ${(friend: UserInfo) => html`
              <div
                class="flex items-center py-3 px-3 border-b-2 border-gray-200 justify-between"
                @click=${() => navigate({ route: 'user', params: { username: friend.username } })}>
                <div class="flex items-center gap-4">
                  ${ProfileIcon({
                    userId: () => friend.id,
                    classes: 'w-9 cursor-pointer'
                  })}

                  <p class="text-gray-700 text-xl font-bold cursor-pointer">${friend.username}</p>
                </div>

                <div
                  class="cursor-pointer flex px-3 py-1 gap-2 items-center rounded-lg bg-red-500 text-white font-bold"
                  @click:stopPropagation=${() => ($dialogFriend = friend)}>
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
