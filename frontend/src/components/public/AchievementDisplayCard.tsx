import { useMemo } from 'react';

type AchievementDisplayTone = 'rank' | 'medal';

type AchievementDisplayCardProps = {
  imageUrl: string;
  alt: string;
  label?: string;
  tone?: AchievementDisplayTone;
  className?: string;
  imageClassName?: string;
  enableParticles?: boolean;
  enableShine?: boolean;
  enableTilt?: boolean;
  particleCount?: number;
};

type ParticleModel = {
  left: string;
  sizePx: number;
  delaySec: number;
  durationSec: number;
};

function clampParticleCount(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 8) {
    return 8;
  }

  return value;
}

function createParticles(seedText: string, count: number): ParticleModel[] {
  const normalizedCount = clampParticleCount(count);
  const seedBase = Array.from(seedText).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

  return Array.from({ length: normalizedCount }, (_, index) => {
    const step = seedBase + (index + 1) * 71;
    const sizePx = 2 + (step % 3);

    return {
      left: `${10 + (step % 78)}%`,
      sizePx,
      delaySec: Number(((step % 7) * 0.25).toFixed(2)),
      durationSec: Number((1.8 + ((step % 5) * 0.32)).toFixed(2)),
    };
  });
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function AchievementDisplayCard({
  imageUrl,
  alt,
  label,
  tone = 'rank',
  className,
  imageClassName,
  enableParticles = false,
  enableShine = true,
  enableTilt = true,
  particleCount = 4,
}: AchievementDisplayCardProps) {
  const particles = useMemo(() => {
    if (!enableParticles) {
      return [];
    }

    return createParticles(`${tone}-${imageUrl}`, particleCount);
  }, [enableParticles, imageUrl, particleCount, tone]);

  return (
    <div className="group relative [perspective:960px]">
      <div
        className={cn(
          'relative isolate h-24 w-20 overflow-hidden rounded-2xl border shadow-[0_16px_32px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:h-27 sm:w-24',
          tone === 'medal'
            ? 'border-[color-mix(in_srgb,var(--public-border)_62%,#f3bf4f_38%)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--public-bg-850)_64%,#2a210f_36%)_0%,color-mix(in_srgb,var(--public-bg-900)_72%,#1f170b_28%)_56%,color-mix(in_srgb,var(--public-bg-950)_86%,#120d06_14%)_100%)]'
            : 'border-[color-mix(in_srgb,var(--public-border)_58%,#7e889c_42%)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--public-bg-850)_68%,#202734_32%)_0%,color-mix(in_srgb,var(--public-bg-900)_80%,#171d29_20%)_60%,color-mix(in_srgb,var(--public-bg-950)_88%,#0f121a_12%)_100%)]',
          enableTilt && 'md:group-hover:[transform:rotateX(4deg)_rotateY(-4deg)_translateY(-2px)]',
          className,
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute inset-x-0 top-0 h-9 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_76%)]',
            tone === 'medal' && 'opacity-95',
          )}
        />

        {enableParticles ? (
          <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((particle, index) => (
              <span
                key={`${imageUrl}-particle-${index}`}
                className="achievement-display-particle absolute bottom-[18%] rounded-full"
                style={{
                  left: particle.left,
                  width: `${particle.sizePx}px`,
                  height: `${particle.sizePx}px`,
                  animationDelay: `${particle.delaySec}s`,
                  animationDuration: `${particle.durationSec}s`,
                }}
              />
            ))}
          </span>
        ) : null}

        {enableShine ? <span aria-hidden className="achievement-display-shine pointer-events-none absolute inset-0" /> : null}

        <div className="relative z-[1] flex h-full items-center justify-center">
          <img
            src={imageUrl}
            alt={alt}
            className={cn('h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.72)]', imageClassName)}
            loading="lazy"
          />
        </div>
      </div>

      {label ? (
        <p className="mt-2 text-center text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--public-text-muted)_90%,#fff_10%)] sm:text-[0.65rem]">
          {label}
        </p>
      ) : null}
    </div>
  );
}
