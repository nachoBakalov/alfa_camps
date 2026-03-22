type PhotoGalleryGridItem = {
  id: string;
  imageUrl: string;
  alt?: string;
  onClick?: () => void;
};

type PhotoGalleryGridProps = {
  items: PhotoGalleryGridItem[];
  className?: string;
  emptyText?: string;
};

export function PhotoGalleryGrid({ items, className, emptyText }: PhotoGalleryGridProps) {
  return (
    <section
      className={[
        'public-section-cards',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {items.length === 0 ? <p className="public-text-muted text-sm">{emptyText ?? 'Няма снимки.'}</p> : null}

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {items.map((item) => {
            const Tile = item.onClick ? 'button' : 'div';

            return (
              <Tile
                key={item.id}
                type={item.onClick ? 'button' : undefined}
                onClick={item.onClick}
                className={[
                  'aspect-square overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--public-border)_18%,transparent)]',
                  item.onClick
                    ? 'transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--public-border)_60%,#fff_40%)]'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <img src={item.imageUrl} alt={item.alt ?? 'Снимка от лагер'} className="h-full w-full object-cover" loading="lazy" />
              </Tile>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export type { PhotoGalleryGridItem };
