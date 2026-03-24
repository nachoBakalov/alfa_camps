import { AchievementDisplayCard } from './AchievementDisplayCard';

type MedalCardProps = {
  imageUrl: string;
  alt: string;
  label?: string;
  className?: string;
};

export function MedalCard({ imageUrl, alt, label, className}: MedalCardProps) {
  return (
    <AchievementDisplayCard
      imageUrl={imageUrl}
      alt={alt}
      label={label}
      tone="medal"
      enableParticles={false}   
      particleCount={5}
      enableShine
      enableTilt
      className={className}
    />
  );
}
