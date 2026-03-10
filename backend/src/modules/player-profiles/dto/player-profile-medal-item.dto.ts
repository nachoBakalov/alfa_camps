import { MedalType } from '../../medals/enums/medal-type.enum';

export class PlayerProfileMedalItemDto {
  playerMedalId!: string;
  medalId!: string;
  name!: string;
  description!: string | null;
  iconUrl!: string | null;
  type!: MedalType;
  note!: string | null;
  awardedAt!: Date;
}
