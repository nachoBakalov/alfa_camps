export class TeamStandingItemDto {
  teamId!: string;
  name!: string;
  color!: string | null;
  logoUrl!: string | null;
  teamPoints!: number;
  finalPosition!: number | null;
  isActive!: boolean;
}
