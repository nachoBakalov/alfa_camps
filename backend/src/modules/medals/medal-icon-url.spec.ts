import {
  DEFAULT_MEDAL_ICON_URL_BY_NAME,
  isLegacyMedalIconUrl,
  normalizeMedalIconUrl,
} from './medal-icon-url';

describe('medal icon url normalization', () => {
  it('maps legacy medal paths to current asset paths', () => {
    expect(normalizeMedalIconUrl('/medals/ura.png')).toBe(DEFAULT_MEDAL_ICON_URL_BY_NAME['Ура']);
    expect(normalizeMedalIconUrl('medals/jelezen-krast.png')).toBe(
      DEFAULT_MEDAL_ICON_URL_BY_NAME['Железен кръст'],
    );
  });

  it('leaves current asset paths unchanged', () => {
    const currentPath = DEFAULT_MEDAL_ICON_URL_BY_NAME['Командо'];

    expect(normalizeMedalIconUrl(currentPath)).toBe(currentPath);
    expect(isLegacyMedalIconUrl(currentPath)).toBe(false);
  });
});