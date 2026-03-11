import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type PlayersQuery = {
  q?: string;
};

export type Player = {
  id: string;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlayerInput = {
  firstName: string;
  lastName?: string;
  nickname?: string;
  avatarUrl?: string;
  isActive?: boolean;
};

function buildPlayersPath(query?: PlayersQuery): string {
  const search = query?.q?.trim();

  if (!search) {
    return '/players';
  }

  const params = new URLSearchParams({ q: search });
  return `/players?${params.toString()}`;
}

export function getPlayers(query?: PlayersQuery): Promise<Player[]> {
  return apiGet<Player[]>(buildPlayersPath(query));
}

export function getPlayer(id: string): Promise<Player> {
  return apiGet<Player>(`/players/${id}`);
}

export function createPlayer(payload: PlayerInput): Promise<Player> {
  return apiPost<Player, PlayerInput>('/players', payload);
}

export function updatePlayer(id: string, payload: PlayerInput): Promise<Player> {
  return apiPatch<Player, PlayerInput>(`/players/${id}`, payload);
}

export function deletePlayer(id: string): Promise<void> {
  return apiDelete<void>(`/players/${id}`);
}
