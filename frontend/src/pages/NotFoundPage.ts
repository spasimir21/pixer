import { Component, useChildComponents, useTimeout } from '@lib/component';
import { useLocalization } from '../service/LocalizationService';
import { useNavigation, useTitle } from '@lib/router';
import LoadingPageComponent from './LoadingPage';
import { UINode } from '@lib/ui';

const NotFoundPageComponent = Component((): UINode => {
  const l = useLocalization();

  useTitle(() => l('pixer.title'));

  const [LoadingPage] = useChildComponents(LoadingPageComponent);

  const { navigate } = useNavigation();

  useTimeout(() => navigate({ route: 'home' }), 0);

  return LoadingPage();
});

export default NotFoundPageComponent;
