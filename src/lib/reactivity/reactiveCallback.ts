import { TrackStack } from './TrackStack';

function createReactiveCallback<TArgs extends [...any[]], T>(
  trackable: (...args: TArgs) => any,
  callback: (...args: TArgs) => T
) {
  return (...args: TArgs) => {
    trackable(...args);

    TrackStack.pushTrackPause();
    const result = callback(...args);
    TrackStack.pop();

    return result;
  };
}

const withoutTracking = <T extends (...args: any) => any>(callback: T) =>
  ((...args: any) => {
    TrackStack.pushTrackPause();
    const result = callback(...args);
    TrackStack.pop();

    return result;
  }) as T;

const runWithoutTracking = <T extends () => any>(func: T) => {
  TrackStack.pushTrackPause();
  const result = func();
  TrackStack.pop();

  return result as ReturnType<T>;
};

export { createReactiveCallback, withoutTracking, runWithoutTracking };
