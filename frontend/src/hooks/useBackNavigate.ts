import { NavigateLocation, useNavigation, useRoute } from '@lib/router';

function useBackNavigate() {
  const { navigate } = useNavigation();
  const route = useRoute();

  return (location: Exclude<NavigateLocation, string>) =>
    navigate({
      ...location,
      search: { referer: $route.path }
    });
}

export { useBackNavigate };
