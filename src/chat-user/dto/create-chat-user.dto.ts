import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString} from 'class-validator';

export class CreateChatUserDto {

  @ApiProperty({
		description: 'Chat_user Url',
    required: false,
		minLength: 6,
	})

  @ApiProperty({
		description: 'Id of the chat',
	})
  @IsNotEmpty()
  chatId: string;
}
