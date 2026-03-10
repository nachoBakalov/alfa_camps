import { IsOptional, IsString } from 'class-validator';

export class QueryPlayersDto {
  @IsString()
  @IsOptional()
  q?: string;
}
