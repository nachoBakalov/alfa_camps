import { Link } from 'react-router-dom';

type CampBannerCardProps = {
  to: string;
  title: string;
  location?: string | null;
  dateLabel: string;
  backgroundImageUrl: string;
  className?: string;
};

export function CampBannerCard({ to, title, location, dateLabel, backgroundImageUrl, className }: CampBannerCardProps) {
  return (
    <Link
      to={to}
      className={[
        'group relative block min-h-36 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--public-border)_22%,transparent)] shadow-[0_10px_22px_rgba(0,0,0,0.24)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--public-border)_62%,#fff_38%)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]" style={{ backgroundImage: `url(${backgroundImageUrl})` }} aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,17,21,0.26)_0%,rgba(15,17,21,0.66)_58%,rgba(15,17,21,0.9)_100%)]" aria-hidden />

      <div className="relative z-[1] flex min-h-36 flex-col justify-end px-4 py-3">
        <p className="text-sm font-semibold uppercase tracking-[0.06em] text-[var(--public-text)]">{title}</p>
        <p className="public-text-muted mt-1 text-xs uppercase tracking-[0.08em]">
          {location ? <span>{location}</span> : null}
          {location ? <span className="mx-1.5 opacity-70">•</span> : null}
          <span>{dateLabel}</span>
        </p>
      </div>
    </Link>
  );
}
