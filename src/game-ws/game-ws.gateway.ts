import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameWsService } from './game-ws.service';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { CreateMessageWDto } from '../message-ws/dto/create-message-w.dto';
import { MessageWsGateway } from '../message-ws/message-ws.gateway';
import { Interval} from '@nestjs/schedule';
import {GlobalServiceGames} from '../services/games.service'

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

	private readonly logger = new Logger("Game Logic");
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

	//Counter down to handle times out
    @Interval(1000)
    handleCountdownInterval() {
      console.log(GlobalServiceGames.games[0]);
      this.logger.log("descontando");
      GlobalServiceGames.games[0]=GlobalServiceGames.games[0]+1;
	}

	//Updating the games
    @Interval(500)
    handleUpdateInterval() {
      console.log(GlobalServiceGames.games[0]);
      this.logger.log("Updating games");
      GlobalServiceGames.games[0]=GlobalServiceGames.games[0]+1;
    }
    //Sending games to clients
    @Interval(1000)
    handleSendingInterval() {
      this.logger.log("Sending games");
      //console.log('Sending Games');
	  this.wss.emit('server-game', "prueba" );	
    }
}
