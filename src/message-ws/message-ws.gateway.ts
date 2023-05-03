import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

import { MessageWsService } from './message-ws.service';
import { CreateMessageWDto } from './dto/create-message-w.dto';
import { UpdateMessageWDto } from './dto/update-message-w.dto';

@WebSocketGateway({
    namespace: 'message-ws',
})
export class MessageWsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessageWsGateway.name);
  constructor(private readonly messageWsService: MessageWsService) {}

  @WebSocketServer() io: Namespace;

  afterInit() {
    this.logger.log("Websocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    
    const socket = this.io.sockets;
  
    this.logger.log(`WS Client with id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${socket.size}`);

    this.io.emit("hello", `from ${client.id}`);
  }  
  
  handleDisconnect(client: Socket) {
    const socket = this.io.sockets;
  
    this.logger.log(`Disconnected socket id ${client.id} `);
    this.logger.debug(`Number of connected clients: ${socket.size}`);

    // this.io.emit("hello from", client.id);
  }

  // postman
  // {
  //   "event": "message",
  //   "data": {
  //     "content": "Hola, este es un mensaje de prueba"
  //   }
  // }
  
  
  @SubscribeMessage('message')
  async handleMessage(@MessageBody() message: CreateMessageWDto, @ConnectedSocket() client: Socket): Promise<void> {
    // Logica para manejar el mensaje, por ejemplo, guardar en base de datos
    this.messageWsService.create(message);
    console.log(message);

    // Emitir el mensaje a todos los clientes conectados menos a quien lo envio
    client.broadcast.emit('message', message);
    // Emitir el mensaje a todos los clientes conectados
    // this.io.emit('message', message);
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
