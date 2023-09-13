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

  // async create(createContactDto: CreateContactDto, user: User) {
  //   try {

  //   if (!isUUID(createContactDto.contactId))
  //     throw new NotFoundException(`Contact with id ${createContactDto.contactId} not founds`);

  //   let contact: User = await this.userRepository.findOneBy( { id: createContactDto.contactId } );

  //   if (!contact)
  //     throw new NotFoundException(`Contact with id ${createContactDto.contactId} not found`);
      
  //   if (createContactDto.contactId == user.id)
  //     throw new NotFoundException(`You cannot add yourself`);
    

  //     const existingChatUser = await this.contactRepository.findOne({
  //       where: {
  //         user: { id: user.id },
  //         contact: { id: contact.id },
  //       },
  //     });
  //     if (existingChatUser)
  //       throw new NotFoundException(`Contact whith id ${createContactDto.contactId} exist no add`);

  //     const newContact = this.contactRepository.create({
  //       user: user,
  //       contact: contact,
  //     });

  //     const newContact2 = this.contactRepository.create({
  //       user: contact,
  //       contact: user,
  //     });
        
  //     await this.contactRepository.save(newContact);
  //     await this.contactRepository.save(newContact2);

  //     const { password,email,isActive,roles, ...resContact } = contact;
  //     return {
  //       message: "new contact",
  //       status: true,
  //       contact: resContact
  //     };
  //   } catch (error) {
  //     // si el error es de tipo EntityNotFoundError, lanzar un error 404
	// 		if (error instanceof EntityNotFoundError) {
	// 			this.exceptionService.handleNotFoundException('Contact not found', `Contact with id not found.`);
	// 		} else {
	// 			// si no, lanzar un error
	// 			this.exceptionService.handleDBExceptions(error);
	// 		}
  //   }
  // }
  
  async create(createContactDto: CreateContactDto, user: User) {
    try {
      const { contactId } = createContactDto;

      if (contactId === user.id) {
          throw new BadRequestException('You cannot add yourself');
      }

      // Verificar si ya existen los contactos
      const existingContact = await this.contactRepository.findOne({
          where: [
              { user: { id: user.id }, contact: { id: contactId } },
              { user: { id: contactId }, contact: { id: user.id } }
          ]
      });
      
      if (existingContact) {
          throw new ConflictException(`Contact with id ${contactId} already exists`);
      }

        // Verificar la existencia del contacto
      const contactData = await this.userRepository.findOne({
        where: { id: contactId }
      });

      if (!contactData) {
          throw new NotFoundException(`Contact with id ${contactId} not found`);
      }

      const newContact = this.contactRepository.create({ user, contact: contactData });
      const reciprocalContact = this.contactRepository.create({ user: contactData, contact: user });

      await this.contactRepository.save([newContact, reciprocalContact]);

      const { password, email, isActive, roles, ...resContact } = contactData;
      return {
          message: "new contact",
          status: true,
          contact: resContact
      };
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
          this.exceptionService.handleNotFoundException('Contact not found', `Contact with id not found.`);
      } else {
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
