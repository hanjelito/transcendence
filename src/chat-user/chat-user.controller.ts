import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ChatUserService } from './chat-user.service';
import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { Auth, ValidRoles } from '../auth/interfaces';
import { GetUser } from 'src/auth/decorators';
import { User } from 'src/user/entities/user.entity';
import { ChatUser } from './entities/chat-user.entity';

@ApiTags('User Chat - Channels')
@Controller('chat-user')
// @Auth(ValidRoles.user)
export class ChatUserController {
  constructor(private readonly chatUserService: ChatUserService) {}



  @Post()
  @Auth(ValidRoles.user)
  @ApiResponse({ status: 201, description: 'Chat User was Created', type: ChatUser })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden, Token related' })
  create(
    @Body() createChatUserDto: CreateChatUserDto,
    @GetUser() user: User,
  ) {
    return this.chatUserService.create(createChatUserDto, user);
  }


  @Get('find-chats-iduser/:identifier')
  @Auth(ValidRoles.user)
  findOne(@Param('identifier') identifier: string) {
    return this.chatUserService.findOneChatUserByIdentifier(identifier);
  }

  @Get('find-chatsid-detail-user/:identifier')
  @Auth(ValidRoles.user)
  findOneChatUserByIdentifierDetail(@Param('identifier') identifier: string) {
    return this.chatUserService.findOneChatUserByIdentifierDetail(identifier);
  }

  @Get('find-to-idchat/:identifier')
  @Auth(ValidRoles.user)
  findOneByIdentifier(@Param('identifier') identifier: string) {
    return this.chatUserService.findAllChatsByUserId(identifier);
  }
}
