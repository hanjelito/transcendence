// Importaciones de varios módulos y servicios de NestJS, Socket.IO, y los módulos personalizados que has creado.
import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CreateMessageWDto } from './dto/create-message-w.dto';
import { CreateChatDto } from '../chat/dto/create-chat.dto';
import { MessageWsService } from './message-ws.service';
// import { ChatService } from '../chat/chat.service';
import { User } from '../auth/entities/user.entity';
import { JwtPayload } from 'src/auth/interfaces';
import { AuthService } from 'src/auth/auth.service';

// Decorador para crear un gateway WebSocket con el namespace 'message-ws'.
// ws://localhost:3000/message-ws
@WebSocketGateway({
	cors: true,
	namespace: 'message-ws',
})
// La clase implementa varias interfaces para manejar eventos del WebSocket.
export class MessageWsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	// Creación de un nuevo Logger y varias dependencias inyectadas en el constructor.
	private readonly logger = new Logger(MessageWsGateway.name);
	constructor(
		private readonly messageWsService: MessageWsService,
		private readonly jwtService: JwtService,
		// private readonly chatService: ChatService,
		private readonly authService: AuthService,
	) {}

	// Una referencia al servidor WebSocket.
	@WebSocketServer()
	wss: Server;

	// Método que se ejecuta después de la inicialización del gateway.
	afterInit() {
		this.logger.log("Websocket Gateway initialized");
	}

	// Método que se ejecuta cuando un cliente se conecta.
	async handleConnection(client: Socket) {

		// Extraer el token JWT del encabezado del mensaje de conexión.
		const token = client.handshake.headers.bearer_token as string;
		let payload: JwtPayload;
		
		// Intenta verificar el token y registra al cliente en el servicio de mensajes.
		try{
			payload = this.jwtService.verify(token);
			await this.messageWsService.registerClient( client, payload.id);

		} catch(error) {
			// Si hay un error durante la verificación del token, desconecta al cliente.
			client.disconnect(true);
			return;
		}
		// Emite un evento para actualizar la lista de clientes conectados.
		this.wss.emit('clients-updated', this.messageWsService.getConnectedClients() );	
	} 
		
	// Método que se ejecuta cuando un cliente se desconecta.
	handleDisconnect(client: Socket) {
		// Elimina al cliente del registro y actualiza la lista de clientes conectados.
		this.messageWsService.removeClient( client.id );
		this.wss.emit('clients-updated', this.messageWsService.getConnectedClients() );
	}

	// Método para manejar mensajes de los clientes.
	@SubscribeMessage('client-message2')
	async handleMessage2(client: Socket, payload: CreateMessageWDto) {
		// Intenta emitir un mensaje con los datos del payload.
		try {
			const structMessage = new CreateMessageWDto();
			structMessage.params = payload.params;
			structMessage.timestamp = payload.timestamp;
			this.wss.emit('message-server',{
				"id": this.messageWsService.getUserFullName( client.id ),
				message: structMessage
			});

		} catch (error) {
			console.error("Error al parsear el payload:", error);
		}
	}

	// Otro método para manejar diferentes tipos de mensajes de los clientes.
	@SubscribeMessage('client-message')
	async handleMessage(client: Socket, payload: CreateMessageWDto) {
		try {
			const command = payload.command;
			const params = payload.params;

			// Dependiendo del comando en el payload, ejecuta diferentes funciones.
			switch (command) {
				case 'JOIN':
					await this.handleJoin(client, params);
					break;
				case 'PART':
					await this.handlePart(client, params);
					break;
				case 'PRIVMSG':
					await this.handlePrivmsg(client, params);
					break;
				case 'KICK':
					await this.handleKick(client, params);
					break;
				default:
					throw new Error(`Unsupported command: ${command}`);
			}
		} catch (error) {
			console.error("Error al parsear el payload:", error);
		}
	}

	// {
	//	 "command": "JOIN",
	//	 "params": {
	//	   "room": "llegando a casa",
	//	   "message": "",
	//	   "event": "",
	//	   "user": "",
	//	   "target": "",
	//	   "password": "12345",
	//	   "reason": "",
	//	   "mode": "",
	//	   "topic": "hola jugadores",
	//	   "nickname": ""
	//	 },
	//	 "timestamp": "TIME_STAMP_OR_NULL"
	//   }

	// Maneja cuando un cliente quiere unirse a un chat.
	async handleJoin(client: Socket, params: any) {
		try {
			const channel = await this.messageWsService.getUserChanelRegister(client, params);
	  
			// Emitir un mensaje al servidor con la información del usuario que se une.

			// this.wss.emit('message-server',{
			//	 response: channel
			// });
			client.emit('message-server',{
				response: channel
			  });
		} catch (error) {
			// Emitir un mensaje de error al cliente.
			client.emit('error', { response: error.response });
			
		}
	}

	// Maneja cuando un cliente quiere dejar un chat.
	async handlePart(client: Socket, params: any) {
		// Aquí se añadiría el código para manejar este caso.
	}

	// Maneja cuando un cliente envía un mensaje privado.
	async handlePrivmsg(client: Socket, params: any) {
		// Emitir un mensaje al servidor con la información del mensaje privado.
		// this.wss.emit('message-server',{
		//	 "id": this.messageWsService.getUserFullName( client.id ),
		//	 message: params
		// });
	}

	// Maneja cuando un cliente quiere expulsar a otro.
	async handleKick(client: Socket, params: any) {
		// Aquí se añadiría el código para manejar este caso.
	}
}