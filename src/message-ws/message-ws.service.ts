import { Injectable } from '@nestjs/common';
import { CreateMessageWDto } from './dto/create-message-w.dto';
import { UpdateMessageWDto } from './dto/update-message-w.dto';
import { MessageW } from './entities/message-w.entity';
import { Socket } from 'socket.io';

interface ConnectClient {
    [id: string]: Socket
}

@Injectable()
export class MessageWsService {

    private connectedClients: ConnectClient = {};

    registerClient( client: Socket )
    {
        this.connectedClients[ client.id ] = client;
    }

    removeClient( clientId: string )
    {
        delete this.connectedClients[ clientId ];
    }

    getConnectedClients():number
    {
        return Object.keys( this.connectedClients ).length;
    }

    // create(createMessageWDto: CreateMessageWDto) {
    //   return 'This action adds a new messageW';
    // }
    async create(createMessageWDto: CreateMessageWDto): Promise<MessageW> {
        const newMessage: MessageW = {
        ...createMessageWDto,
        // Agregar cualquier otra propiedad que necesite MessageW aquí
        };
        return newMessage;
        // Logica para crear el mensaje y guardar en base de datos
        // Devuelve una promesa
    }



    // findAll() {
    //   return `This action returns all messageWs`;
    // }

    // findOne(id: number) {
    //   return `This action returns a #${id} messageW`;
    // }

    // update(id: number, updateMessageWDto: UpdateMessageWDto) {
    //   return `This action updates a #${id} messageW`;
    // }

    // remove(id: number) {
    //   return `This action removes a #${id} messageW`;
    // }
}
