export type AssetManifestName =
  | 'avatars'
  | 'camp-logos'
  | 'camp-covers'
  | 'team-tokens'
  | 'ranks'
  | 'achievements'
  | 'medals';

export type AssetManifestItem = {
  id: string;
  label: string;
  url: string;
  category?: string;
  threshold?: number;
};
