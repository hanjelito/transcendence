import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ChatUserService } from './chat-user.service';
import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { UpdateChatUserDto } from './dto/update-chat-user.dto';
import { Auth, ValidRoles } from '../auth/interfaces';
import { Request } from 'express';
import { ChatUser } from './entities/chat-user.entity';
import { GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('chat-user')
@Auth(ValidRoles.user)
export class ChatUserController {
  constructor(private readonly chatUserService: ChatUserService) {}

  // @Post()
  // create(@Body() createChatUserDto: CreateChatUserDto, @Req() req: Request): Promise<ChatUser> {
  //   return this.chatUserService.create(createChatUserDto, req);
  // }

  @Post()
  create(
    @Body() createChatUserDto: CreateChatUserDto,
    @GetUser() user: User,
  ) {
    return this.chatUserService.create(createChatUserDto, user);
  }

  // @Get()
  // findAll() {
  //   return this.chatUserService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.chatUserService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatUserDto: UpdateChatUserDto) {
  //   return this.chatUserService.update(+id, updateChatUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.chatUserService.remove(+id);
  // }
}
