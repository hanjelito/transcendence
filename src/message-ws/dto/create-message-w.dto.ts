import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Params {
  @IsString()
  @IsOptional()
  room?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  event?: string;

  @IsString()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  target?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  mode?: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsString()
  @IsOptional()
  nickname?: string;
}

export class CreateMessageWDto {
  @IsString()
  command: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Params)
  params: Params;

  @IsString()
  @IsOptional()
  timestamp?: string;
}