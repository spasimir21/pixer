import { Component, useChildComponents, useTimeout } from '@lib/component';
import LoadingPageComponent from './LoadingPage';
import { useNavigation } from '@lib/router';
import { UINode } from '@lib/ui';

const NotFoundPageComponent = Component((): UINode => {
  const [LoadingPage] = useChildComponents(LoadingPageComponent);

  const { navigate } = useNavigation();

  useTimeout(() => navigate({ route: 'home' }), 0);

  return LoadingPage();
});

export default NotFoundPageComponent;
