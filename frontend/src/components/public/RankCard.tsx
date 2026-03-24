import { AchievementDisplayCard } from './AchievementDisplayCard';

type RankCardProps = {
  imageUrl: string;
  alt: string;
  label?: string;
  className?: string;
};

export function RankCard({ imageUrl, alt, label, className }: RankCardProps) {
  return (
    <AchievementDisplayCard
      imageUrl={imageUrl}
      alt={alt}
      label={label}
      tone="rank"
      enableParticles={false}
      enableShine
      enableTilt
      className={className}
    />
  );
}
