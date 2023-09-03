// Importaciones de varios módulos y servicios de NestJS, Socket.IO, y los módulos personalizados que has creado.
import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CreateMessageWDto, Params } from './dto/create-message-w.dto';
import { JwtPayload } from '../auth/interfaces';
import { ChatMessageWsService, MessageWsService, SocketManagerService } from './services';
import { SocketEventsService } from 'src/services/socket-events.service';

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
		private readonly chatMessageWsService: ChatMessageWsService,
		private readonly jwtService: JwtService,
		private readonly socketManagerService: SocketManagerService,
		// private readonly authService: AuthService,
		private readonly socketEventsService: SocketEventsService,
	) {}

	// Una referencia al servidor WebSocket.
	@WebSocketServer()
	wss: Server;

	// private clients = new Map<string, string[]>();

	// Método que se ejecuta después de la inicialización del gateway.
	afterInit() {
		this.logger.log("Websocket Gateway initialized");
	}

	// Método que se ejecuta cuando un cliente se conecta.
	async handleConnection(client: Socket) {

		// Extraer el token JWT del encabezado del mensaje de conexión.
        const token = client.handshake.headers.authorization;
  		// const token = authHeader && authHeader.split(' ')[1];
		  
		  let payload: JwtPayload;
		  // Intenta verificar el token y registra al cliente en el servicio de mensajes.
		try{
			payload = this.jwtService.verify(token);
			//
			this.socketManagerService.registerClient(payload.id, client.id);
			//

		} catch(error) {
			// Si hay un error durante la verificación del token, desconecta al cliente.
			client.disconnect(true);
			return;
		}
	}
	// Método que se ejecuta cuando un cliente se desconecta.
	handleDisconnect(client: Socket) {
		this.socketManagerService.unregisterClient(client);
	}

	// Otro método para manejar diferentes tipos de mensajes de los clientes.
	@SubscribeMessage('client-message')
	async handleMessage(client: Socket, payload: CreateMessageWDto) {
		try {
			const params = payload.params;
			// console.log(payload);
			// Dependiendo del comando en el payload, ejecuta diferentes funciones.
			switch (params.command) {
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
					throw new NotFoundException(`Unsupported command: ${params.command}`);
			}
		} catch (error) {
			client.emit('error', { response: error.response });
		}
	}

	// Maneja cuando un cliente quiere unirse a un chat.
	async handleJoin(client: Socket, params: any) {
		try {
			const idUser = this.socketManagerService.getUserIdBySocketId(client.id);
			const channel = await this.chatMessageWsService.getUserChanelRegister(client, params, idUser);
			
	  
			client.emit('message-server',{
				response: channel
			  });
		} catch (error) {
			// Emitir un mensaje de error al cliente.
			client.emit('error', { response: error.response });
			
		}
	}

	async handlePart(client: Socket, params: any) {
		// Aquí se añadiría el código para manejar este caso.
	}

	async handlePrivmsg(client: Socket, params: Params) {
		try {
			const idUser = this.socketManagerService.getUserIdBySocketId(client.id);
			if (params.type === 'room') {
				const userOnlineChat = await this.messageWsService.getActiveChatUsers(params.target)
				userOnlineChat.forEach(user => {
					user.clientIds.forEach(clientId => {
						const messageData = {
							id:			idUser,
							user:		params.user,
							message:	params.message,
							target:		params.target,
							type:		params.type,
							name:		params.name,
							command:	params.command,
						};
						if (clientId != client.id) {
							this.wss.to(clientId).emit('message-server', messageData);
							this.emitMessageAndNotification(client, true, clientId, 'message-server', messageData);
						}
					});
				});
			}
			else {
				const idSockets = this.socketManagerService.getClients(params.target);
				const userDB = await this.messageWsService.getUserFullData(idUser);
			
				idSockets.forEach(idSocket => {
					const messageData = {
						id: params.target,
						user: userDB.login,
						message: params.message,
						target: userDB.id,
						type: params.type,
					};
					// Comprueba si el ID del socket del cliente es diferente del ID del socket del remitente.
					if (idSocket != client.id) {
						this.wss.to(idSocket).emit('message-server', messageData);
						this.emitMessageAndNotification(client, true, idSocket, 'message-server', messageData);
					}
				});
			}
		} catch (error) {
			client.emit('error', { response: error.response });
		}
	}

	private emitMessageAndNotification(client: Socket, sendValue: boolean, clientId: string, messageType: string, messageData: any) {
		if (sendValue)
			this.socketEventsService.emitNotificationPrivate(client, clientId,  { type: 'chat-message', data: messageData});
	}

	// private emitContact
	// notificaciones

	async handleKick(client: Socket, params: any) {
		// Aquí se añadiría el código para manejar este caso.
	}
}
