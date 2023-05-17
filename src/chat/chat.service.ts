import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Chat } from './entities';
import { User } from '../auth/entities/user.entity';
import { ChatUser } from '../chat-user/entities/chat-user.entity';
import { CustomHttpException } from './exceptions/custom-http-exception';
import { ChatUserService } from '../chat-user/chat-user.service';
import { CreateChatUserDto } from '../chat-user/dto/create-chat-user.dto';



@Injectable()
export class ChatService {

  private readonly logger = new Logger('ChatService');

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(ChatUser)
    private chatUsersRepository: Repository<ChatUser>,

    private readonly chatUserService: ChatUserService,

    private readonly: DataSource

    ) {}

//TODO: add pagination
  async findAll( PaginationDto: PaginationDto)
  {
    const { limit, offset } = PaginationDto;
    const chat = await this.chatRepository.find({
      take: limit,
      skip: offset,
      relations: {
        chatUser: true,
      },
    });
    // aplano las imagenes
    return chat.map( ({ chatUser, ...res}) => ({
      ...res,

    }))
  }

  async findOne(identifier: string)
  {
    let chat: Chat;
    
    if (isUUID(identifier)) {
      chat = await this.chatRepository.findOneBy( { id: identifier } );
    } else {
      chat = await this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.chatUser', 'chatUser')
        .leftJoinAndSelect('chatUser.user', 'user')
        .leftJoinAndSelect('chat.user', 'chatOwner')
        .orderBy('chatUser.id', 'ASC')
        .where('UPPER(chat.name) = :name OR chat.slug = :slug', {
          name: identifier.toUpperCase(),
          slug: identifier.toLowerCase(),
        })
        .getOne();
    }     

    if (!chat) {
      throw new NotFoundException(`Chat with id  ${ identifier } not found`);
    }
    return chat;
  }

  //plain chatUsers call controller
  async findOnePlain( term: string )
  {
    const { ...rest } = await this.findOne( term );
    return {
      ...rest
    }
  }
  
  async create(createChatDto: CreateChatDto, user: User) {
    try {
      const { ...chatDetails } = createChatDto;
  
      // Verificar si el chat ya existe
      let existingChat = await this.chatRepository.findOne({ where: { name: chatDetails.name } });
      const chatUser = new CreateChatUserDto();
  
      let chat;
      if (existingChat) {
        chatUser.chatId = existingChat.id;
      } else {
        // Crear una nueva instancia de Chat y asignarle los valores de chatDetails y user
        chat = new Chat();
        Object.assign(chat, chatDetails);
        chat.user = user;
  
        // Guardar la instancia de Chat en la base de datos
        const chatBD : Chat = await this.chatRepository.save(chat);
        chatUser.chatId = chatBD.id;
        existingChat = chatBD;
      }
  
      const chatUserBD = await this.chatUserService.create(chatUser, user);
      return { chat: existingChat, register: chatUserBD.status};
  
    } catch (error) {
      // Lanzar una excepción personalizada
      if (error instanceof CustomHttpException) {
        throw error;
      } else {
        throw new CustomHttpException('', false, 'Error al crear el chat: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async update(id: string, updateChatDto: UpdateChatDto, user: User)
  {

    const { chatUser, ...toUpdate } = updateChatDto;

    const chat = await this.chatRepository.preload({ id, ...toUpdate });
    
    if (!chat) throw new NotFoundException(`Chat with id  ${ id } not found`);

    // create query runner
    const queryRunner = this.readonly.createQueryRunner();
    // establecer conexion con la base de datos 
    await queryRunner.connect();
    // hace la transaccion en el caso que falle hace rollback
    await queryRunner.startTransaction();

    try {

      if ( chatUser )
      {
        // eliminar las imagenes anteriores
        // await queryRunner.manager.delete( ChatUser, { chat: { id } });

        // chat.chatUser = chatUser.map(
        //   image => this.chatUsersRepository.create()
        // );
      }

      chat.user = user;

      await queryRunner.manager.save(chat);

      // await this.chatRepository.save(chat);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain( id );

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string)
  {
    const Chat = await this.chatRepository.findOneBy( { id } );
    if (!Chat) {
      throw new NotFoundException(`Chat with id  ${ id } not found`);
    }
    await this.chatRepository.remove(Chat);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async deleteAllChats()
  {
    const query = this.chatRepository.createQueryBuilder();
    try {
      return await query
        .delete()
        .where({})
        .execute();
    }
    catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
