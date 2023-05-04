import { IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MessageData {
  @IsString()
  content: string;
}

export class CreateMessageWDto {
  @IsString()
  event: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MessageData)
  data: MessageData;
}