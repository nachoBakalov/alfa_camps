import { apiDelete, apiGet, apiPost, apiPostFormData } from './client';

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

export type PhotoUploadInput = {
  campId?: string;
  teamId?: string;
  playerId?: string;
};

export function createPhoto(payload: PhotoInput): Promise<Photo> {
  return apiPost<Photo, PhotoInput>('/photos', payload);
}

export function uploadPhoto(file: File, payload: PhotoUploadInput): Promise<Photo> {
  const formData = new FormData();
  formData.append('file', file);

  if (payload.campId?.trim()) {
    formData.append('campId', payload.campId.trim());
  }

  if (payload.teamId?.trim()) {
    formData.append('teamId', payload.teamId.trim());
  }

  if (payload.playerId?.trim()) {
    formData.append('playerId', payload.playerId.trim());
  }

  return apiPostFormData<Photo>('/photos/upload', formData);
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
