import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';

import { CreateMessageWDto } from './dto/create-message-w.dto';
import { UpdateMessageWDto } from './dto/update-message-w.dto';
import { MessageW } from './entities/message-w.entity';
import { User } from '../auth/entities/user.entity';

interface ConnectClient {
    [id: string]:{
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessageWsService {

    private connectedClients: ConnectClient = {};

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async registerClient( client: Socket, userId: string )
    {
        const user = await this.userRepository.findOneBy({ id: userId });
        if( !user ) throw new Error("User not found");
        if( !user.isActive ) throw new Error("User is not active");

        this.connectedClients[ client.id ] = {
            socket: client,
            user: user
        };
    }

    removeClient( clientId: string )
    {
        delete this.connectedClients[ clientId ];
    }

    getConnectedClients():number
    {
        console.log(this.connectedClients);
        return Object.keys( this.connectedClients ).length;
    }

    getUserFullName( socketId: string )
    {
        return this.connectedClients[ socketId ].user.name + ' ' + this.connectedClients[ socketId ].user.lastName;
    }

    // create(createMessageWDto: CreateMessageWDto) {
    //   return 'This action adds a new messageW';
    // }



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
