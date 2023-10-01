import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EntityNotFoundError, Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateContactDto } from './dto/create-contact.dto';
// import { UpdateContactDto } from './dto/update-contact.dto';
import { ExceptionService } from '../services/exception.service';
import { Contact } from './entities/contact.entity';
import { User } from '../user/entities/user.entity';
import { isUUID } from 'class-validator';
import { DeleteContactDto } from './dto/delete-contact.dto';

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

  async remove(deleteContactDto: DeleteContactDto, user: User) {
    try {
        const { contactId } = deleteContactDto;
        if (contactId === user.id) {
            throw new BadRequestException('You cannot delete yourself');
        }
        const existingContact = await this.contactRepository.findOne({
            where: [
                { user: { id: user.id }, contact: { id: contactId } },
                { user: { id: contactId }, contact: { id: user.id } }
            ]
        });
        console.log(existingContact.id);

        if (!existingContact) {
            throw new NotFoundException(`Contact with id ${contactId} not found`);
        }

        const deleteQueryBuilder = this.contactRepository.createQueryBuilder();

        await deleteQueryBuilder
            .delete()
            .from(Contact)
            .where("userId = :userId AND contactId = :contactId", { userId: user.id, contactId: contactId })
            .orWhere("userId = :contactId AND contactId = :userId", { userId: user.id, contactId: contactId })
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
