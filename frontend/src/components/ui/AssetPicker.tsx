import { useEffect, useState } from 'react';
import { getAssetManifest } from '../../api/assets.api';
import type { AssetManifestItem, AssetManifestName } from '../../types/assets';

type AssetPickerProps = {
  manifest: AssetManifestName;
  selectedUrl?: string;
  onSelect: (url: string) => void;
  title?: string;
  filterCategory?: string;
};

export function AssetPicker({
  manifest,
  selectedUrl,
  onSelect,
  title = 'Choose Asset',
  filterCategory,
}: AssetPickerProps) {
  const [assets, setAssets] = useState<AssetManifestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAssets() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getAssetManifest(manifest);
        if (isMounted) {
          setAssets(data);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load assets.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAssets();

    return () => {
      isMounted = false;
    };
  }, [manifest]);

  const normalizedFilter = filterCategory?.trim().toLowerCase() ?? '';
  const visibleAssets = normalizedFilter
    ? assets.filter((asset) => (asset.category ?? '').trim().toLowerCase() === normalizedFilter)
    : assets;

  return (
    <section className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{title}</p>

      {isLoading ? <p className="text-sm text-slate-500">Loading assets...</p> : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!isLoading && !error && visibleAssets.length === 0 ? (
        <p className="text-sm text-slate-500">No assets found in manifest.</p>
      ) : null}

      {!isLoading && !error && visibleAssets.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {visibleAssets.map((asset) => {
            const isSelected = selectedUrl === asset.url;

            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onSelect(asset.url);
                }}
                className={
                  isSelected
                    ? 'rounded-md border-2 border-sky-500 bg-sky-50 p-1 text-left'
                    : 'rounded-md border border-slate-200 bg-white p-1 text-left hover:bg-slate-50'
                }
              >
                <img
                  src={asset.url}
                  alt={asset.label}
                  className="h-16 w-full rounded object-cover"
                  loading="lazy"
                />
                <p className="mt-1 truncate text-xs text-slate-600">{asset.label}</p>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
