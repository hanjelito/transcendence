import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameWsService } from './game-ws.service';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { MessageWsGateway } from '../message-ws/message-ws.gateway';

import { JwtPayload } from '../auth/interfaces';


@WebSocketGateway({
	cors: {
		origin: '*',
		//allowedHeaders: 'Access-Control-Allow-Origin, Content-Type',
		transports: ['websocket', 'polling'],
		credentials: true,
	},
	namespace: 'game-ws',
})

export class GameWsGateway {

	private readonly logger = new Logger(MessageWsGateway.name);
	constructor(
		private readonly gameWsService: GameWsService,
		private readonly jwtService: JwtService,
		private readonly authService: AuthService,
	) {}

	@WebSocketServer()
	wss: Server;

	afterInit() {
		this.logger.log("Websocket Gateway initialized");
	}

	async handleConnection(client: Socket) {
		// console.log(client);
		this.wss.emit('status', `Conectado` );	
	}

	handleDisconnect(client: Socket) {
		// console.log(client);
		this.wss.emit('status', `Desconectado` );	
	}

	@SubscribeMessage('client-game')
	async handleMessage(client: Socket, payload: any) {
		try {
			this.wss.emit('server-game', payload );	

		} catch (error) {
			console.error("Error al parsear el payload:", error);
		}
	}
}
