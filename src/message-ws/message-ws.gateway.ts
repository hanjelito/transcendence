import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Namespace, Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

import { MessageWsService } from './message-ws.service';
import { CreateMessageWDto } from './dto/create-message-w.dto';
import { UpdateMessageWDto } from './dto/update-message-w.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({
    namespace: 'message-ws',
})
export class MessageWsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger(MessageWsGateway.name);
    constructor(
        private readonly messageWsService: MessageWsService,
        private readonly jwtService: JwtService,
    ) {}

    @WebSocketServer()
    wss: Server;
    


    afterInit() {
        this.logger.log("Websocket Gateway initialized");
    }

    handleConnection(client: Socket) {

        const token = client.handshake.headers.bearer_token as string;
        let payload: JwtPayload;
        
        try{
            payload = this.jwtService.verify(token);
        }catch(error){
            client.disconnect(true);
            console.log("Error al validar el token");
            return;
        }

        console.log({ payload });

        this.messageWsService.registerClient( client );
        this.wss.emit('clients-updated', this.messageWsService.getConnectedClients() );    
    } 
    
    handleDisconnect(client: Socket) {

        this.messageWsService.removeClient( client.id );
        this.wss.emit('clients-updated', this.messageWsService.getConnectedClients() );

    }

    // postman
    // {
    //     "event": "message",
    //     "data": {
    //       "content": "Hola, este es un mensaje de prueba"
    //     }
    // }
    
    


    @SubscribeMessage('message-client')
    async handleMessage(client: Socket, payload: CreateMessageWDto) {
        try {

            const structMessage = new CreateMessageWDto();
            structMessage.event = payload.event;
            structMessage.data = payload.data;

            console.log({
                "id": client.id,
                "payload": payload,
            });

            this.wss.emit('clients', "te esuchooooo");

        } catch (error) {
            console.error("Error al parsear el payload:", error);
        }
    }


  // @SubscribeMessage('createMessageW')
  // create(@MessageBody() createMessageWDto: CreateMessageWDto) {
  //   return this.messageWsService.create(createMessageWDto);
  // }

  // @SubscribeMessage('findAllMessageWs')
  // findAll() {
  //   return this.messageWsService.findAll();
  // }

  // @SubscribeMessage('findOneMessageW')
  // findOne(@MessageBody() id: number) {
  //   return this.messageWsService.findOne(id);
  // }

  // @SubscribeMessage('updateMessageW')
  // update(@MessageBody() updateMessageWDto: UpdateMessageWDto) {
  //   return this.messageWsService.update(updateMessageWDto.id, updateMessageWDto);
  // }

  // @SubscribeMessage('removeMessageW')
  // remove(@MessageBody() id: number) {
  //   return this.messageWsService.remove(id);
  // }
}
