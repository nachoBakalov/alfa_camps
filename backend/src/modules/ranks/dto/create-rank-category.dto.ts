import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRankCategoryDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}
