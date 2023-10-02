import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { EntityNotFoundError, Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateContactDto } from './dto/create-contact.dto';
// import { UpdateContactDto } from './dto/update-contact.dto';
import { ExceptionService } from '../services/exception.service';
import { Contact } from './entities/contact.entity';
import { User } from '../user/entities/user.entity';
import { isUUID } from 'class-validator';
import { DeleteContactDto } from './dto/delete-contact.dto';
import { SocketManagerService } from '../message-ws/services/socketManager-ws.service';

@Injectable()
export class ContactService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Contact) private contactRepository: Repository<Contact>,
    private readonly socketManagerService: SocketManagerService,
    private exceptionService: ExceptionService
  ) {}

    	// Una referencia al servidor WebSocket.
    @WebSocketServer()
    wss: Server;

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
        
        // Emit update to sockets of the client
        // Obtiene los sockets abiertos por cada cliente.
        const idSockets = this.socketManagerService.getClients(user.id);
        
        // Sacar la lista de constactos
        const new_Contact_list = await this.contactRepository.find({
          where: [
                { user: { id: user.id }}
            ]
        });

        // se emite a si mismo y a sus diferentes sockets.
        idSockets.forEach(idSocket => {
          //this.wss.to(idSocket).emit('my-contact-server', new_Contact_list);
          this.wss.to(idSocket).emit('server-game', {
            command: 'UPDATE_CONTACTS',
            data: new_Contact_list,
            timestamp:  Date.now() 
          });
          console.log("updating list contacts because new", new_Contact_list)
        });
        
        /*
        if (idSockets.length === 1){
          contacts.forEach(async (contact) => {
            const contactSockets = this.socketManagerService.getClients(contact.id);
            contactSockets.forEach(socketId => {
              this.wss.to(socketId).emit('connect-contact-server', idUser);
            });
          });
        }
        */
        
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
        
        // Emit update to sockets of the client
        // Obtiene los sockets abiertos por cada cliente.
        const idSockets = this.socketManagerService.getClients(user.id);
        
        // Sacar la lista de constactos
        const new_Contact_list = await this.contactRepository.find({
          where: [
                { user: { id: user.id }}
            ]
        });

        // se emite a si mismo y a sus diferentes sockets.
        idSockets.forEach(idSocket => {
          //this.wss.to(idSocket).emit('my-contact-server', new_Contact_list);
          this.wss.to(idSocket).emit('server-game', {
            command: 'UPDATE_CONTACTS',
            data: new_Contact_list,
            timestamp:  Date.now() 
          });
          console.log("updating list contacts because delete", new_Contact_list)
        });

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
