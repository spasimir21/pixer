import { Component, useChildComponents } from '@lib/component';
import { NavigateToComponent } from '@lib/router';
import LoadingPageComponent from './LoadingPage';
import { UINode } from '@lib/ui';

const NotFoundPageComponent = Component((): UINode => {
  const [NavigateTo, LoadingPage] = useChildComponents(NavigateToComponent, LoadingPageComponent);

  return NavigateTo({ route: 'home' }, LoadingPage);
});

export { NotFoundPageComponent };
