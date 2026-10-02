import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigateWhenReady(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
    return true;
  }
  return false;
}
