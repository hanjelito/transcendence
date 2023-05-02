import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MinLength, MaxLength, IsArray } from 'class-validator';

export class CreateChatDto {
	
	@ApiProperty({
		description: 'Chat title (unique)',
		nullable: false,
		minLength: 5,
	})
	@IsString()
	@MinLength(5)
	@MaxLength(20)
	name: string;
	
	@ApiProperty({
		description: 'Description of the chat',
		maxLength: 30,
	})
	@IsString()
	@IsOptional()
	@MaxLength(30)
	description?: string;
	
	@ApiProperty({
		description: 'Private chat (false)',
		default: false,
		required: false,
	})
	@IsBoolean()
	@IsOptional()
	private: boolean;

	slug: string;
	
	@ApiProperty({
		description: 'Password chat',
		required: false,
	})
	@IsString()
	@IsOptional()
	@MinLength(5)
	@MaxLength(10)
	password: string;

	// size: string[];

	@ApiProperty({
	})
	@IsString({ each: true })
	@IsArray()
	@IsOptional()
	chatUser: string[];
}
