import { NavigateLocation, useNavigation } from '@lib/router';
import { Component, useTimeout } from '@lib/component';
import { html, UINode } from '@lib/ui';

const NavigateToComponent = Component(
  (location: NavigateLocation, fallback?: (() => UINode) | null, replace?: boolean): UINode => {
    const { navigate } = useNavigation();

    useTimeout(() => navigate(location, replace), 0);

    return fallback ? fallback() : html``;
  }
);

export { NavigateToComponent };
