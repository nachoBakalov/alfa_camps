import { ScopedPhotosSection } from './ScopedPhotosSection';

export function CampPhotosTab({ campId }: { campId: string }) {
  return (
    <ScopedPhotosSection
      scopeType="camp"
      scopeId={campId}
      title="Качване на снимки"
      description="Добави снимки към този лагер. Изображенията се оптимизират автоматично преди качване."
      galleryTitle="Галерия на лагера"
      galleryDescription="Всички качени снимки за текущия лагер."
    />
  );
}
