import { IsNotEmpty, IsString} from 'class-validator';

export class CreateChatUserDto {

  @IsString()
  @IsNotEmpty()
  url: string;

  // @IsNotEmpty()
  // userId: string;

  @IsNotEmpty()
  chatId: string;
}
