import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ChatImage, Chat } from './entities';


@Injectable()
export class ChatService {

  private readonly logger = new Logger('ChatService');

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(ChatImage)
    private chatImageRepository: Repository<ChatImage>,

    private readonly: DataSource

    ) {}

  async create(createChatDto: CreateChatDto) {
    try {
      const { images = [], ...chatDetails } = createChatDto;

      const chat = this.chatRepository.create({
        ...chatDetails,
        images: images.map( image => this.chatImageRepository.create( {url: image}) )
      });

      await this.chatRepository.save(chat);
      //retorno el chat con las imagenes
      return {...chat, images};

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
//TODO: add pagination
  async findAll( PaginationDto: PaginationDto)
  {
    const { limit, offset } = PaginationDto;
    const chat = await this.chatRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });
    // aplano las imagenes
    return chat.map( ({ images, ...res}) => ({
      ...res,
      images: images.map( img => img.url)
    }))
  }

  async findOne(identifier: string)
  {
    let chat: Chat;
    
    if (isUUID(identifier)) {
      chat = await this.chatRepository.findOneBy( { id: identifier } );
    } else {
      const queryBuilder = this.chatRepository.createQueryBuilder('chat');
      chat = await queryBuilder.where(
        'UPPER(name) = :name or slug = :slug', { 
          name: identifier.toUpperCase(),
          slug: identifier.toLowerCase(),
        }
      )
      .leftJoinAndSelect('chat.images', 'chatImage')
      .getOne();
    }

    if (!chat) {
      throw new NotFoundException(`Chat with id  ${ identifier } not found`);
    }
    return chat;
  }

  //plain chatImage call controller
  async findOnePlain( term: string )
  {
    const { images = [], ...rest } = await this.findOne( term);
    return {
      ...rest,
      images: images.map( image => image.url )
    }
  }

  async update(id: string, updateChatDto: UpdateChatDto)
  {

    const { images, ...toUpdate } = updateChatDto;

    const chat = await this.chatRepository.preload({ id, ...toUpdate });
    
    if (!chat) throw new NotFoundException(`Chat with id  ${ id } not found`);

    // create query runner
    const queryRunner = this.readonly.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if ( images )
      {
        await queryRunner.manager.delete( ChatImage, { chat: { id } });

        chat.images = images.map(
          image => this.chatImageRepository.create( { url: image})
        );
      }

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
