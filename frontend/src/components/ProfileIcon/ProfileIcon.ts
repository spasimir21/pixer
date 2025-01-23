import { Component, useEffect, useState } from '@lib/component';
import { B2ServiceManager } from '../../service/B2Service';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';
import { toHex } from '@lib/utils/hex';

const ProfileIconComponent = Component(
  ({ userId, classes = '' }: { userId: () => Uint8Array | null; classes?: string }): UINode => {
    const b2Service = useService(B2ServiceManager);

    const imageSrc = useState<string | null>(null);

    useEffect(() => {
      const id = userId();

      if (id == null) {
        $imageSrc = '/assets/profile.png';
        return;
      }

      const hexId = toHex(id);

      const image = document.createElement('img');
      image.src = b2Service.profileIcon(hexId);

      image.onload = () => ($imageSrc = image.src);
      image.onerror = () => ($imageSrc = '/assets/profile.png');
    });

    return html`
      <img src=${$imageSrc ?? '/assets/blank.png'} class=${`object-cover rounded-full ${classes} bg-gray-300`} />
    `;
  }
);

export { ProfileIconComponent };
