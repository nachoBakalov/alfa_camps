export type AuthState = {
  accessToken: string | null;
  userId: string | null;
  email: string | null;
  role: string | null;
};

export type AuthPayload = {
  accessToken: string;
  userId: string;
  email: string;
  role: string;
};

const AUTH_STORAGE_KEY = 'alfa_camp_auth';

type Listener = () => void;

const listeners = new Set<Listener>();

function emptyAuthState(): AuthState {
  return {
    accessToken: null,
    userId: null,
    email: null,
    role: null,
  };
}

function readAuthStateFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return emptyAuthState();
    }

    const parsed = JSON.parse(raw) as Partial<AuthState>;

    return {
      accessToken:
        typeof parsed.accessToken === 'string' && parsed.accessToken.length > 0
          ? parsed.accessToken
          : null,
      userId: typeof parsed.userId === 'string' && parsed.userId.length > 0 ? parsed.userId : null,
      email: typeof parsed.email === 'string' && parsed.email.length > 0 ? parsed.email : null,
      role: typeof parsed.role === 'string' && parsed.role.length > 0 ? parsed.role : null,
    };
  } catch {
    return emptyAuthState();
  }
}

function writeAuthStateToStorage(state: AuthState): void {
  if (!state.accessToken) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

let authState: AuthState = readAuthStateFromStorage();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getAuthState(): AuthState {
  return authState;
}

export function getAccessToken(): string | null {
  return authState.accessToken;
}

export function getRole(): string | null {
  return authState.role;
}

export function isAuthenticated(): boolean {
  return Boolean(authState.accessToken);
}

export function setAuth(payload: AuthPayload): void {
  authState = {
    accessToken: payload.accessToken,
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  writeAuthStateToStorage(authState);
  notify();
}

export function logout(): void {
  authState = emptyAuthState();
  writeAuthStateToStorage(authState);
  notify();
}
