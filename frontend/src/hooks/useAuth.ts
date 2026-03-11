import { useSyncExternalStore } from 'react';
import {
  getAccessToken,
  getAuthState,
  getRole,
  isAuthenticated,
  logout,
  setAuth,
  subscribeAuth,
  type AuthPayload,
} from '../store/auth.store';

export function useAuth() {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState, getAuthState);

  return {
    auth,
    accessToken: auth.accessToken,
    userId: auth.userId,
    email: auth.email,
    role: auth.role,
    isAuthenticated: isAuthenticated(),
    getToken: getAccessToken,
    getRole,
    login: (payload: AuthPayload) => setAuth(payload),
    logout,
  };
}
