export const DEFAULT_MEDAL_ICON_URL_BY_NAME = {
  'Лъвско сърце': '/assets/ranks/medals/lionheart.png',
  'Железен кръст': '/assets/ranks/medals/ironcrest.png',
  'Безсмъртен войн': '/assets/ranks/medals/survivor.png',
  'Командо': '/assets/ranks/medals/comando.png',
  'Ура': '/assets/ranks/medals/horeey.png',
} as const;

const LEGACY_MEDAL_ICON_URL_MAP: Readonly<Record<string, string>> = {
  '/medals/lavsko-sarce.png': DEFAULT_MEDAL_ICON_URL_BY_NAME['Лъвско сърце'],
  'medals/lavsko-sarce.png': DEFAULT_MEDAL_ICON_URL_BY_NAME['Лъвско сърце'],
  '/medals/jelezen-krast.png': DEFAULT_MEDAL_ICON_URL_BY_NAME['Железен кръст'],
  'medals/jelezen-krast.png': DEFAULT_MEDAL_ICON_URL_BY_NAME['Железен кръст'],
  '/medals/bezsmarten-voin.png': DEFAULT_MEDAL_ICON_URL_BY_NAME['Безсмъртен войн'],
  'medals/bezsmarten-voin.png': DEFAULT_MEDAL_ICON_URL_BY_NAME['Безсмъртен войн'],
  '/medals/komando.png': DEFAULT_MEDAL_ICON_URL_BY_NAME['Командо'],
  'medals/komando.png': DEFAULT_MEDAL_ICON_URL_BY_NAME['Командо'],
  '/medals/ura.png': DEFAULT_MEDAL_ICON_URL_BY_NAME['Ура'],
  'medals/ura.png': DEFAULT_MEDAL_ICON_URL_BY_NAME['Ура'],
};

function normalizeLookupKey(iconUrl: string): string {
  return iconUrl.trim().replace(/\\/g, '/');
}

export function isLegacyMedalIconUrl(iconUrl: string | null | undefined): boolean {
  if (!iconUrl) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(
    LEGACY_MEDAL_ICON_URL_MAP,
    normalizeLookupKey(iconUrl),
  );
}

export function normalizeMedalIconUrl(iconUrl: string | null | undefined): string | null {
  if (iconUrl == null) {
    return null;
  }

  const normalizedKey = normalizeLookupKey(iconUrl);
  return LEGACY_MEDAL_ICON_URL_MAP[normalizedKey] ?? iconUrl;
}