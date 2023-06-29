import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EntityNotFoundError, Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ExceptionService } from '../services/exception.service';
import { Contact } from './entities/contact.entity';
import { User } from '../user/entities/user.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class ContactService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Contact) private contactRepository: Repository<Contact>,
    private exceptionService: ExceptionService
  ) {}

  async create(createContactDto: CreateContactDto, user: User) {
    try {

    let contact: User;

    if (!isUUID(createContactDto.contactId))
      throw new NotFoundException(`Contact with id ${createContactDto.contactId} not founds`);

			contact = await this.userRepository.findOneBy( { id: createContactDto.contactId } );
      if (!contact)
        throw new NotFoundException(`Contact with id ${createContactDto.contactId} not found`);
      
        
        const existingChatUser = await this.contactRepository.findOne({
          where: {
            user: { id: user.id },
            contact: { id: contact.id },
          },
        });
        if (existingChatUser)
          throw new NotFoundException(`Contact whith id ${createContactDto.contactId} exist no add`);

        const newContact = this.contactRepository.create({
          user: user,
          contact: contact,
        });
        
        await this.contactRepository.save(newContact);

        const { password,email,isActive,roles, ...resContact } = contact;
        return {
          message: "new contact",
          status: true,
          contact: resContact
        };
    } catch (error) {
      // si el error es de tipo EntityNotFoundError, lanzar un error 404
			if (error instanceof EntityNotFoundError) {
				this.exceptionService.handleNotFoundException('Contact not found', `Contact with id not found.`);
			} else {
				// si no, lanzar un error
				this.exceptionService.handleDBExceptions(error);
			}
    }
  }

  // findAll() {
  //   return `This action returns all contact`;
  // }

  async findOne(id: string) {
    try {
        if (!isUUID(id))
          throw new NotFoundException(`Contact with id ${id} not founds`);

          const contacts = await this.contactRepository.find({
            where: {
              user: { id: id },
            },
            relations: ["contact"],
          });
      
        if (!contacts) 
          return [];
        
        // Devolver los contactos
        // return contacts;
        return contacts.map(contact => ({
          id: contact.contact.id,
          login: contact.contact.login,
          name: contact.contact.name,
          images: contact.contact.images,
          blocked: contact.blocked,
        }));
        
      } catch (error) {
        if (error instanceof EntityNotFoundError) {
          this.exceptionService.handleNotFoundException('Contact not found', `Contact with id not found.`);
        } else {
          // si no, lanzar un error
          this.exceptionService.handleDBExceptions(error);
        }
      }
  }

  // update(id: number, updateContactDto: UpdateContactDto) {
  //   return `This action updates a #${id} contact`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} contact`;
  // }
}
