import type { AssetManifestItem, AssetManifestName } from '../types/assets';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toManifestItem(value: unknown): AssetManifestItem | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== 'string' || typeof value.label !== 'string' || typeof value.url !== 'string') {
    return null;
  }

  return {
    id: value.id,
    label: value.label,
    url: value.url,
    category: typeof value.category === 'string' ? value.category : undefined,
    threshold: typeof value.threshold === 'number' ? value.threshold : undefined,
  };
}

export async function getAssetManifest(manifest: AssetManifestName): Promise<AssetManifestItem[]> {
  const response = await fetch(`/assets/manifests/${manifest}.json`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load manifest: ${manifest}`);
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map(toManifestItem).filter((item): item is AssetManifestItem => item !== null);
}
