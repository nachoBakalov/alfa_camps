export type AssetManifestName = 'avatars' | 'camp-logos' | 'camp-covers' | 'team-tokens' | 'ranks';

export type AssetManifestItem = {
  id: string;
  label: string;
  url: string;
  category?: string;
  threshold?: number;
};
