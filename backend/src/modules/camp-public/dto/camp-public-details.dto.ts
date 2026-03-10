import { CampStatus } from '../../camps/enums/camp-status.enum';

export class CampPublicDetailsCampTypeDto {
  campTypeId!: string;
  campTypeName!: string;
  campTypeSlug!: string;
  campTypeLogoUrl!: string | null;
  campTypeCoverImageUrl!: string | null;
}

export class CampPublicDetailsDto {
  campId!: string;
  title!: string;
  year!: number;
  startDate!: string;
  endDate!: string;
  location!: string | null;
  description!: string | null;
  logoUrl!: string | null;
  coverImageUrl!: string | null;
  status!: CampStatus;
  finalizedAt!: Date | null;
  campType!: CampPublicDetailsCampTypeDto;
}
