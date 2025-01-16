import { APIServiceManager } from '../service/APIService';
import { Component } from '@lib/component';
import { requests } from '../api/requests';
import { useService } from '@lib/service';
import { html, UINode } from '@lib/ui';

const HomePageComponent = Component((): UINode => {
  const apiService = useService(APIServiceManager);

  const send = async () => {
    const response = await apiService.send({ username: 'spasimir21' }, requests.user.create);

    console.log(response);
  };

  return html`<button @click=${send}>Send</button>`;
});

export default HomePageComponent;
