import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameWsService } from './game-ws.service';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { CreateMessageWDto } from '../message-ws/dto/create-message-w.dto';
import { MessageWsGateway } from '../message-ws/message-ws.gateway';


@WebSocketGateway({
	cors: true,
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
    this.wss.emit('status', `Conectado` );	
	}

  handleDisconnect(client: Socket) {
		this.wss.emit('status', `Desconectado` );	
	}

  @SubscribeMessage('client-game')
	async handleMessage2(client: Socket, payload: CreateMessageWDto) {
		try {
			

		} catch (error) {
			console.error("Error al parsear el payload:", error);
		}
	}

}

