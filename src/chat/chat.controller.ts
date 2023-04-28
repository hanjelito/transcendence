import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ChatService } from './chat.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth, ValidRoles } from '../auth/interfaces';
import { GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';

@Controller('chat')
@Auth(ValidRoles.admin)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  // TODO: Puede llevar independientemente de la autenticación
  // @Auth(ValidRoles.admin)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.chatService.findAll( paginationDto );
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    return this.chatService.findOnePlain(identifier);
  }

  @Post()
  create(
    @Body() createChatDto: CreateChatDto,
    @GetUser() user: User,
  ) {
    return this.chatService.create(createChatDto, user);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @GetUser() user: User,
    @Body() updateChatDto: UpdateChatDto
  ){
    return this.chatService.update(id, updateChatDto, user);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.chatService.remove(id);
  }
}
