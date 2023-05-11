import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Chat } from './entities';
import { User } from '../auth/entities/user.entity';
import { ChatUser } from '../chat-user/entities/chat-user.entity';


@Injectable()
export class ChatService {

  private readonly logger = new Logger('ChatService');

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(ChatUser)
    private chatUsersRepository: Repository<ChatUser>,

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
      ...rest,
      // chatUser: chatUser.map( user => user.url)
    }
  }

  async create(createChatDto: CreateChatDto, user: User) {
    try {
      const { ...chatDetails } = createChatDto;
  
      // Crear una nueva instancia de Chat y asignarle los valores de chatDetails y user
      const chat = new Chat();
      Object.assign(chat, chatDetails);
      chat.user = user;
  
      // Guardar la instancia de Chat en la base de datos
      await this.chatRepository.save(chat);
  
      // Retornar el chat creado
      return { ...chat };
    } catch (error) {
      this.handleDBExceptions(error);
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
        await queryRunner.manager.delete( ChatUser, { chat: { id } });

        chat.chatUser = chatUser.map(
          image => this.chatUsersRepository.create( { url: image})
        );
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
