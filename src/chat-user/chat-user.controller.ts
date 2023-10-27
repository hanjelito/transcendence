import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ChatUserService } from './chat-user.service';
import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { Auth, ValidRoles } from '../auth/interfaces';
import { GetUser } from 'src/auth/decorators';
import { User } from 'src/user/entities/user.entity';
import { ChatUser } from './entities/chat-user.entity';
import { UpdateChatUserDto } from './dto/update-chat-user.dto';

@ApiTags('User Chat - Channels')
@Controller('chat-user')
export class ChatUserController {
  constructor(private readonly chatUserService: ChatUserService) {}

  // @Patch('silence/:userIdSilence')
  // @Auth(ValidRoles.user)
  // updateSilence(
  //   @Param('userIdSilence') userIdSilence: string,
  //   @Body() updateChatUserDto: CreateChatUserDto,
  //   @GetUser() user: User,
  // ) {
  //   return this.chatUserService.updateSilence(userIdSilence, updateChatUserDto, user);
  // };

  // @Patch('moderator/:userIdModerator')
  // @Auth(ValidRoles.user)
  // updateModerator(
  //   @Param('userIdModerator') userIdModerator: string,
  //   @Body() updateChatUserDto: CreateChatUserDto,
  //   @GetUser() user: User,
  // ) {
  //   return this.chatUserService.updateModerator(userIdModerator, updateChatUserDto, user);
  // };
 
  @Patch('moderator/:userIdModerator')
  @Auth(ValidRoles.user)
  updateModerator(
    @Param('userIdModerator') userIdModerator: string,
    @Body() updateChatUserDto: CreateChatUserDto,
    @GetUser() user: User,
  ) {
    return this.chatUserService.updateUserProperty(userIdModerator, updateChatUserDto, user);
  };
 


  @Get('find-user-in-chat/:idChat/:idUser')
  @Auth(ValidRoles.user)
  findOneUserInChat(
    @Param('idChat') idChat: string,
    @Param('idUser') idUser: string
  ) {
    return this.chatUserService.findAllUsersInChat(idChat, idUser);
  }

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


  @Get('find-chats-iduser/:idChat')
  @Auth(ValidRoles.user)
  findOne(@Param('idChat') idChat: string) {
    return this.chatUserService.findOneChatUserByIdentifier(idChat);
  }

  @Get('find-chatsid-detail-user/:idChat')
  @Auth(ValidRoles.user)
  findOneChatUserByIdentifierDetail(@Param('idChat') idChat: string) {
    return this.chatUserService.findOneChatUserByIdentifierDetail(idChat);
  }

  @Get('find-to-idchat/:idUser')
  @Auth(ValidRoles.user)
  findOneByIdentifier(@Param('idUser') idUser: string) {
    return this.chatUserService.findAllChatsByUserId(idUser);
  }

  
}
