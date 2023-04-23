import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateChatDto {
	@IsString()
	@MinLength(5)
	@MaxLength(20)
	name: string;
	
	@IsString()
	@IsOptional()
	@MaxLength(30)
	description?: string;
	
	@IsBoolean()
	@IsOptional()
	private: boolean;

	slug: string;

	@IsString()
	@IsOptional()
	@MinLength(5)
	@MaxLength(10)
	password: string;

	// size: string[];
}
