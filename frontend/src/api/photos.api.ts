import { apiDelete, apiGet, apiPost } from './client';

export type Photo = {
  id: string;
  campId: string | null;
  teamId: string | null;
  playerId: string | null;
  imageUrl: string;
  uploadedBy: string | null;
  createdAt: string;
};

export type PhotoInput = {
  campId?: string;
  teamId?: string;
  playerId?: string;
  imageUrl: string;
};

export function createPhoto(payload: PhotoInput): Promise<Photo> {
  return apiPost<Photo, PhotoInput>('/photos', payload);
}

export function deletePhoto(id: string): Promise<void> {
  return apiDelete<void>(`/photos/${id}`);
}

export function getPhotosByCamp(campId: string): Promise<Photo[]> {
  return apiGet<Photo[]>(`/camps/${campId}/photos`);
}

export function getPhotosByTeam(teamId: string): Promise<Photo[]> {
  return apiGet<Photo[]>(`/teams/${teamId}/photos`);
}

export function getPhotosByPlayer(playerId: string): Promise<Photo[]> {
  return apiGet<Photo[]>(`/players/${playerId}/photos`);
}
