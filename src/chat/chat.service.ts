import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBuilder, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Chat } from './entities/chat.entity';
import { validate as isUUID } from 'uuid';


@Injectable()
export class ChatService {

  private readonly logger = new Logger('ChatService');

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {}

  async create(createChatDto: CreateChatDto) {
    try {
      const chat = this.chatRepository.create(createChatDto);
      await this.chatRepository.save(chat);
      
      return chat;

    } catch (error) {
      this.handleDBException(error);
    }
  }
//TODO: add pagination
  findAll( PaginationDto: PaginationDto)
  {
    const { limit, offset } = PaginationDto;
    return this.chatRepository.find({
      take: limit,
      skip: offset,
      //TODO: relations
    });
  }

  async findOne(identifier: string)
  {
    let chat: Chat;
    
    if (isUUID(identifier)) {
      chat = await this.chatRepository.findOneBy( { id: identifier } );
    } else {
      const queryBuilder = this.chatRepository.createQueryBuilder();
      chat = await queryBuilder.where(
        'UPPER(name) = :name or slug = :slug', { 
          name: identifier.toUpperCase(),
          slug: identifier.toLowerCase(),
        }
      ).getOne();
    }

    if (!chat) {
      throw new NotFoundException(`Chat with id  ${ identifier } not found`);
    }
    return chat;
  }

  async update(id: string, updateChatDto: UpdateChatDto)
  {
    const chat = await this.chatRepository.preload({
      id:id,
      ...updateChatDto
    });
    
    if (!chat) throw new NotFoundException(`Chat with id  ${ id } not found`);

    try {
      await this.chatRepository.save(chat);
      return chat;
    } catch (error) {
      this.handleDBException(error);
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

  private handleDBException(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
