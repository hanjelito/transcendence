import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { User } from '../auth/entities/user.entity';
import { Chat } from 'src/chat/entities';
import { ChatUser } from './entities/chat-user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { ExceptionService } from 'src/services/exception.service';

@Injectable()
export class ChatUserService {

  private readonly logger = new Logger('ChatService');
  
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    
    @InjectRepository(ChatUser)
    private chatUsersRepository: Repository<ChatUser>,

    private readonly exceptionService: ExceptionService,


  ) {}

  async create(createChatUserDto: CreateChatUserDto, user: User) {
    try {
      const { chatId, ...chatUserDetails } = createChatUserDto;
  
      if (!isUUID(chatId))
        throw new NotFoundException(`Chat with id ${chatId} not founds`);
  
      const chat = await this.chatRepository.findOneBy({ id: chatId });
  
      if (!chat) 
        throw new NotFoundException(`Chat with id ${chatId} not found`);
  
      // Buscar un registro existente con el mismo chatId y userId
      const existingChatUser = await this.chatUsersRepository.findOneBy({ chat: { id: chatId }, user: { id: user.id } });
  
      if (existingChatUser) {
        // Si ya existe un registro, lanzar un error o devolver el registro existente
        throw new ConflictException({
          chat: existingChatUser.chat,
          message: 'User is already registered in this chat.',
        });
      }
  
      const chatUser = this.chatUsersRepository.create(chatUserDetails);
      chatUser.chat = chat;
      chatUser.user = user;
  
      await this.chatUsersRepository.save(chatUser);

      // retorna el chatUser creado con el usuario y el chat
      return { ...chatUser };
  
    } catch (error) {
      // si el error es de tipo EntityNotFoundError, lanzar un error 404
      if (error instanceof EntityNotFoundError) {
        this.exceptionService.handleNotFoundException('Chat not found', `Chat with id not found.`);
      } else {
        // si no, lanzar un error
        this.exceptionService.handleDBExceptions(error);
      }
    }
  }
  
  // findAll() {
  //   return `This action returns all chatUser`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} chatUser`;
  // }

  // update(id: number, updateChatUserDto: UpdateChatUserDto) {
  //   return `This action updates a #${id} chatUser`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} chatUser`;
  // }

}
