import { AuthenticatedRoute } from '../components/AuthenticatedRoute';
import { Component } from '@lib/component';
import { html, UINode } from '@lib/ui';

const HomePageComponent = Component((): UINode => {
  return html``;
});

export default AuthenticatedRoute(HomePageComponent);
