import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityNotFoundError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ExceptionService } from '../services/exception.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { DeleteContactDto } from './dto/delete-contact.dto';
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
      const { contactId } = createContactDto;

      if (contactId === user.id) {
          throw new BadRequestException('You cannot add yourself');
      }

      // Verificar si ya existen los contactos
      const existingContact = await this.contactRepository.findOne({
          where: [
                { user: { id: user.id }, contact: { id: contactId } }
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

        await this.contactRepository.save([newContact]);

        const { password, twoFASecret, first_time, email, isActive, roles, ...resContact } = contactData;
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

  async findOneDual(id: string) {
    try {
      if (!isUUID(id))
          throw new NotFoundException(`Contact with id ${id} not founds`);

      const mutualContacts = await this.contactRepository.createQueryBuilder("c1")
          .innerJoin("Contact", "c2", "c1.userId = c2.contactId AND c1.contactId = c2.userId")
          .where("c1.userId = :id AND c1.contactId != :id", { id: id })
          .leftJoinAndSelect("c1.contact", "contact")
          .getMany();

      if (!mutualContacts.length) 
          return [];

      return mutualContacts.map(contact => ({
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
          this.exceptionService.handleDBExceptions(error);
      }
    }
  }

  async remove(deleteContactDto: DeleteContactDto, user: User) {
    try {
        const { contactId } = deleteContactDto;
        if (contactId === user.id) {
            throw new BadRequestException('You cannot delete yourself');
        }
        const existingContact = await this.contactRepository.findOne({
            where: [
                { user: { id: user.id }, contact: { id: contactId } },
                // { user: { id: contactId }, contact: { id: user.id } }
            ]
        });

        if (!existingContact) {
            throw new NotFoundException(`Contact with id ${contactId} not found`);
        }

        const deleteQueryBuilder = this.contactRepository.createQueryBuilder();

        await deleteQueryBuilder
            .delete()
            .from(Contact)
            .where("userId = :userId AND contactId = :contactId", { userId: user.id, contactId: contactId })
            // .orWhere("userId = :contactId AND contactId = :userId", { userId: user.id, contactId: contactId })
            .execute();

        return {
            message: "Contact deleted successfully",
            status: true
        };

    } catch (error) {
        if (error instanceof EntityNotFoundError) {
            this.exceptionService.handleNotFoundException('Contact not found', `Contact with id not found.`);
        } else {
            this.exceptionService.handleDBExceptions(error);
        }
    }
  }
}
