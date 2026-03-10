import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePlayerDto {
	@IsString()
	@IsOptional()
	firstName?: string;

	@IsString()
	@IsOptional()
	lastName?: string;

	@IsString()
	@IsOptional()
	nickname?: string;

	@IsString()
	@IsOptional()
	avatarUrl?: string;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
