import { StateNode, ValueNode } from '@lib/reactivity';
import { Component, useChildComponents, useComputed, useEffect, useState } from '@lib/component';
import { Friend } from '@api/dto/friendRequest';
import { html, UINode } from '@lib/ui';
import { ProfileIconComponent } from '../ProfileIcon/ProfileIcon';
import { useLocalization } from '../../service/LocalizationService';

const UserSelectComponent = Component(
  ({
    open,
    users,
    onUserSelected
  }: {
    open: StateNode<() => void>;
    users: ValueNode<Friend[]>;
    onUserSelected: (user: Friend) => void;
  }): UINode => {
    const [ProfileIcon] = useChildComponents(ProfileIconComponent);

    const l = useLocalization();

    const isOpen = useState(false);
    const search = useState('');

    $open = () => {
      $isOpen = true;
      $search = '';
    };

    return html`
      <div
        @click=${() => ($isOpen = false)}
        .hidden=${!$isOpen}
        class="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-25 z-50 flex items-end justify-center">
        <div
          @click:stopPropagation=${() => {}}
          class="bg-white h-[60vh] w-screen max-w-[500px] rounded-t-2xl p-4 flex flex-col gap-4">
          <input
            type="text"
            class="border-gray-400 border-2 rounded-md text-xl outline-none px-2 py-1 w-full"
            placeholder=${l('user.select.search')}
            :value#=${$search} />

          <div class="flex flex-col items-stretch grow overflow-y-auto">
            <p
              .hidden=${$users.some(user => user.username.toLowerCase().includes($search.toLowerCase()))}
              class="text-xl text-gray-700 text-center">
              ${l('user.select.noUsers')}
            </p>

            <each ${$users}>
              ${(user: Friend) => html`
                <div
                  .hidden=${!user.username.toLowerCase().includes($search.toLowerCase())}
                  class="flex items-center gap-4 py-3 px-3 border-b-2 border-gray-200"
                  @click=${() => (($isOpen = false), onUserSelected(user))}>
                  ${ProfileIcon({
                    userId: () => user.id,
                    classes: 'w-9'
                  })}

                  <p class="text-gray-700 text-xl font-bold">${user.username}</p>
                </div>
              `}
            </each>
          </div>
        </div>
      </div>
    `;
  }
);

export { UserSelectComponent };
