const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

function joinBaseAndPath(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBase}${path}`;
}

export function resolveBackendAssetUrl(url: string): string {
  if (!url) {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (!url.startsWith('/')) {
    return url;
  }

  if (!API_BASE_URL) {
    return url;
  }

  return joinBaseAndPath(API_BASE_URL, url);
}
