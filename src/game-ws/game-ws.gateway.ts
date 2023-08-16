import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameWsService } from './game-ws.service';
import { Socket, Server } from 'socket.io';
import {Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { CreateMessageWDto } from '../message-ws/dto/create-message-w.dto';
import { MessageWsGateway } from '../message-ws/message-ws.gateway';
import { Interval} from '@nestjs/schedule';
import {GlobalServiceGames} from '../services/games.service'
import {GamesUserService} from '../games _user/gamesuser.service'
import { match } from 'assert';
import {GamesService} from '../games/games.service'

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
	//@Inject(GamesService)
	private readonly logger = new Logger("Game Logic");
	//private readonly gamesService: GamesService;
	constructor(
		//@Inject(GamesService)
		private readonly gameWsService: GameWsService,
		private readonly jwtService: JwtService,
		private readonly authService: AuthService,
		private readonly gamesService : GamesService,
		private readonly gamesuserService : GamesUserService,
	) {}

	@WebSocketServer()
	wss: Server;
 
	afterInit() {
		this.logger.log("Websocket Gateway initialized");
	}

	async handleConnection(client: Socket) {
		//console.log(client);
		this.wss.emit('status', `Conectado` );
	}

	handleDisconnect(client: Socket) {
		//console.log(client.id);
		this.wss.emit('status', `Desconectado` );	
	}

	@SubscribeMessage('client-game')
	async handleMessage(client: Socket, payload: any) {
		try {
			// join waiting room
			if (payload.command === 'REQUEST_INFO'){
				console.log("test init")
				// Send waiting room when connected
				this.wss.emit('server-game', {
					command: 'WAITING_ROOM',
					data: GlobalServiceGames.waiting_room,
					timestamp:  Date.now() 
				} );
				// Send game list when connected
				this.wss.emit('server-game', {
					command: 'GAME_LIST',
					data: GlobalServiceGames.games,
					timestamp:  Date.now() 
					} );	
				this.wss.emit('server-game', {
					command: 'MSG',
					params: { //player_id_1:payload.params.player_id_1,
							player_id_1:'*',
							player_id_2:'*', //payload.params.player_id_2,
							msg: "Prueba de conexion inicial: "
							}, 
					timestamp:  Date.now()
					} );	
			}
			// Player status
			if (payload.command === 'UPDATE_PLAYER_STAT'){
				console.log(payload.params)
				for (let game of GlobalServiceGames.games){
					if (game.game_id === payload.params.game_id){
							if (payload.params.player_id === game.p1id) {
								game.p1_state = payload.params.player_status;
								if (game.p1_state & game.p2_state){
									game.game_status = 1
									game.game_count= GlobalServiceGames.game_cfg.time_start;
								}
								break
							}
							if (payload.params.player_id === game.p2id) {
								game.p2_state = payload.params.player_status;
								if (game.p1_state & game.p2_state){
									game.game_status = 1
									game.game_count= GlobalServiceGames.game_cfg.time_start;
								}
								break
							}	
					}
				}
			}
			// Update player position
			if (payload.command === 'UPDATE_PLAYER_MOV'){
					//console.log(payload.params)
					for (let game of GlobalServiceGames.games){
						if (game.game_id === payload.params.game_id){
								if (payload.params.player_id === game.p1id) {
									game.p1y = payload.params.player_pos;
									game.p1time = payload.timestamp
									break
								}
								if (payload.params.player_id === game.p2id) {
									game.p2y = payload.params.player_pos;
									game.p2time = payload.timestamp
									break
								}	
						}
					}
			}
			// join waiting room
			if (payload.command === 'JOIN_WAITING_ROOM'){
				//Check if you are in a game --> notify
				GlobalServiceGames.waiting_room = payload.params
				this.wss.emit('server-game', {
					command: 'WAITING_ROOM',
					data: GlobalServiceGames.waiting_room,
					timestamp:  Date.now() 
				} );
			}
			// join waiting room
			if (payload.command === 'LEAVE_WAITING_ROOM'){
				//Check if you are in a game --> notify
				GlobalServiceGames.waiting_room = null
				this.wss.emit('server-game', {
					command: 'WAITING_ROOM',
					data: GlobalServiceGames.waiting_room,
					timestamp:  Date.now() 
				} );
			}
			// created game from waiting room
			if (payload.command === 'CREATED_WAITING_ROOM'){
				console.log("Want to created",payload.params)
				//Check if you are in a game --> notify --> delete waiting room?
				// created new game ---> notify to users
				let flag = 0
				for (let game of GlobalServiceGames.games){
					if ((game.p1id === payload.params.player_id_1) || (game.p2id === payload.params.player_id_1)){
						flag = 1
						break
					}
					if ((game.p1id === payload.params.player_id_2) || (game.p2id === payload.params.player_id_2)){
						flag = 2
						break
					}
				}
				if (flag === 0){
					let ang = Math.random()*(2) + -1
					let c = GlobalServiceGames.game_cfg.time_wait
					GlobalServiceGames.games.push( {
						game_id: GlobalServiceGames.games.length + 1,
						game_status:0,
						game_count: GlobalServiceGames.game_cfg.time_wait,
						game_type: payload.params.game_level, 
						game_vel: GlobalServiceGames.game_cfg.game_vel,
						ballpos:[500,250],
						ballvel:[Math.cos(ang),Math.sin(ang)],
						ballrad: GlobalServiceGames.game_cfg.ballrad,
						p1id: payload.params.player_id_1,
						p1nick: payload.params.player_nick_1,
						p1y:250,
						p1time : Date.now(),
						p1ptos:0,
						p1_state: false,
						p2id: payload.params.player_id_2,
						p2nick: payload.params.player_nick_2,
						p2y:250,
						p2time :Date.now(), 
						p2ptos:0,
						p2_state: false, 
						pad:GlobalServiceGames.game_cfg.pad
						}
					)
					GlobalServiceGames.waiting_room = null
					// sent message new game start
					this.wss.emit('server-game', {
						command: 'MSG',
						params: { //player_id_1:payload.params.player_id_1,
									player_id_1:'*',
								  player_id_2:payload.params.player_id_2,
								  msg: "Game creado: " + payload.params.player_nick_1 + " vs " + payload.params.player_nick_2
								}, 
						timestamp:  Date.now()
						 } );
				}
				if (flag === 1){
					// sent notify payload.params.player_id_1 esta un game
					this.wss.emit('server-game', {
						command: 'MSG',
						params: { player_id_1:payload.params.player_id_1,
								  player_id_2:payload.params.player_id_2,
								  msg: "imposible crear juego "+payload.params.player_nick_1 + " está jugando"
								}, 
						timestamp:  Date.now()
						 } );
					GlobalServiceGames.waiting_room = null
				}
				if (flag === 2){
					// sent notify payload.params.player_id_2 esta un game
					this.wss.emit('server-game', {
						command: 'MSG',
						params: { player_id_1:payload.params.player_id_1,
								  player_id_2:payload.params.player_id_2,
								  msg: "imposible crear juego "+payload.params.player_nick_2 + " está jugando"
								}, 
						timestamp:  Date.now()
						 } );
					GlobalServiceGames.waiting_room = null
				}
				this.wss.emit('server-game', {
					command: 'WAITING_ROOM',
					data: GlobalServiceGames.waiting_room,
					timestamp:  Date.now() 
				} );
			}	
		} catch (error) {
			console.error("Error al parsear el payload:", error);
		}
	}

	//Counter down to handle times out
    @Interval(1000)
    handleCountdownInterval() {
		for (let game of GlobalServiceGames.games){
			game.game_count = game.game_count - 1
				// Handle time out enter the game no viene nadie
				if (game.game_status === 0 && game.game_count <= 0){
					//destroy game 
					let tmp_array=[]
					let i = 0
					for (let gam of GlobalServiceGames.games){
						if (gam.game_id != game.game_id){
							tmp_array[i]=gam
							i++;
						} 
					} 
					GlobalServiceGames.games = tmp_array
					this.wss.emit('server-game', {
						command: 'GAME_LIST',
						data: GlobalServiceGames.games,
						timestamp:  Date.now() 
						 } );
					//send  notificación  
					this.wss.emit('server-game', {
						command: 'MSG',
						params: { player_id_1:game.p1id,
									player_id_2:game.p2id,
								  msg: "game destroy por incomparecencia"
								}, 
						timestamp:  Date.now()
						 } );

				}
				if (game.game_status === 1  && game.game_count <= 0){
					game.game_status = 2
					game.game_count = GlobalServiceGames.game_cfg.time_play // Si tiempo limite de partida
				}
				if (game.game_status === 2  && game.game_count <= 0){  
					game.game_status = 3
					game.game_count = GlobalServiceGames.game_cfg.time_show //  tiempo vista resultados
				}
				if (game.game_status === 3  && game.game_count <= 0){  
					game.game_status = 4
					game.game_count = 0 // 
					//save results in data base before destroy
					this.gamesService.create({
						p1_id: game.p1id,
						p1_nick: game.p1nick,
						p2_id: game.p2id,
						p2_nick: game.p2nick,
						p1_goals: game.p1ptos,
						p2_goals: game.p2ptos,
						p1_ptos: game.p1ptos > game.p2ptos ? 3: (game.p1ptos === game.p2ptos ? 1: 0),
						p2_ptos: game.p2ptos > game.p1ptos ? 3: (game.p1ptos === game.p2ptos ? 1: 0),
						timestamp:  Date.now()
					})
					
					this.gamesuserService.create({
						player_id: game.p1id,
						nick: game.p1nick,
						goalF: game.p1ptos,
						goalC: game.p2ptos,
						win: game.p1ptos > game.p2ptos ? 1: 0,
						los: game.p1ptos < game.p2ptos ? 1: 0,
						tid: game.p1ptos === game.p2ptos ? 1: 0,
						ptos: game.p1ptos > game.p2ptos ? 3: (game.p1ptos === game.p2ptos ? 1: 0),
						timestamp:  Date.now()
					})
					this.gamesuserService.create({
						player_id: game.p2id,
						nick: game.p2nick,
						goalF: game.p2ptos,
						goalC: game.p1ptos,
						win: game.p2ptos > game.p1ptos ? 1: 0,
						los: game.p2ptos < game.p1ptos ? 1: 0,
						tid: game.p2ptos === game.p1ptos ? 1: 0,
						ptos: game.p2ptos > game.p1ptos ? 3: (game.p2ptos === game.p1ptos ? 1: 0),
						timestamp:  Date.now()
					})
					
				}
				if (game.game_status === 4  && game.game_count <= 0){  //destroy ended games
					let tmp_array=[]
					let i = 0
					for (let gam of GlobalServiceGames.games){
						if (gam.game_status != 4){
							tmp_array[i]=gam
							i++;
						} 
					} 
					GlobalServiceGames.games = tmp_array
					this.wss.emit('server-game', {
						command: 'GAME_LIST',
						data: GlobalServiceGames.games,
						timestamp:  Date.now() 
						 } );
				}
		}
	}

	//Updating the games
    @Interval(60)
    handleUpdateInterval() {
	  for (let game of GlobalServiceGames.games){
		if (game.game_status === 2) {  // play time
			// Calculo parametros trayectoria ball y = m * x + d
			let m = (game.ballvel[1]*game.game_vel) / (game.ballvel[0]*game.game_vel)
			let d = game.ballpos[1] - m * game.ballpos[0]
			let hit = false
			// Pad player 2
			let xc = 990
			let yc = m * xc + d
			if ( ((xc >= game.ballpos[0]) && (xc <= (game.ballpos[0]+game.ballvel[0]*game.game_vel))) // player 2
				 && ( (yc >= (game.p2y - game.pad[1]/2)) && (yc <= (game.p2y + game.pad[1]/2)) )
				){
					//game.ballpos[1] = game.ballpos[1] + game.ballvel[1]*game.game_vel
					//let delta = (Math.abs(game.ballvel[0]*game.game_vel) - Math.abs(game.ballpos[0] - 990))
					//game.ballpos[0] = xc > game.ballpos[0] ? xc - delta: xc + delta
					//game.ballvel[0] = game.ballvel[0] * -1
					//game.ballpos[0] = game.ballpos[0] + game.ballvel[0]*game.game_vel
					let rebounce_angle=-((game.p2y-yc)/(game.pad[1]/2))*(75*Math.PI/180)
					let d1 = Math.sqrt(Math.pow(game.ballvel[0]*game.game_vel,2)+Math.pow(game.ballvel[1]*game.game_vel,2))
					let d2 = Math.sqrt(Math.pow(yc-game.ballpos[1],2)+Math.pow(xc-game.ballpos[0],2))
					//console.log(d1,d2,d1-d2)
					game.ballvel[0] = -Math.cos(rebounce_angle)
					game.ballvel[1] = Math.sin(rebounce_angle)
					game.ballpos[0] = xc+(d1-d2)*game.ballvel[0]
					game.ballpos[1] = yc+(d1-d2)*game.ballvel[1]
					//console.log("vx:",game.ballvel[0], " vy:", game.ballvel[1], "x:", game.ballpos[0], "y:", game.ballpos[1])
					hit = true
				}
			// Pad Player 1
			xc = 10
			yc = m * xc + d
			if ( ((xc <= game.ballpos[0]) && (xc >= (game.ballpos[0]+game.ballvel[0]*game.game_vel))) // player 1
				&& ( (yc >= (game.p1y - game.pad[1]/2)) && (yc <= (game.p1y + game.pad[1]/2)) )
				){
					//game.ballpos[1] = game.ballpos[1] + game.ballvel[1]*game.game_vel
					//let delta = (Math.abs(game.ballvel[0]*game.game_vel) - Math.abs(game.ballpos[0] - 10))
					//game.ballpos[0] = xc > game.ballpos[0] ? xc - delta: xc + delta
					//game.ballvel[0] = game.ballvel[0] * -1
					let rebounce_angle=-((game.p1y-yc)/(game.pad[1]/2))*(75*Math.PI/180)
					let d1 = Math.sqrt(Math.pow(game.ballvel[0]*game.game_vel,2)+Math.pow(game.ballvel[1]*game.game_vel,2))
					let d2 = Math.sqrt(Math.pow(yc-game.ballpos[1],2)+Math.pow(xc-game.ballpos[0],2))
					console.log(d1,d2,d1-d2)
					game.ballvel[0] = Math.cos(rebounce_angle)
					game.ballvel[1] = Math.sin(rebounce_angle)
					game.ballpos[0] = xc+(d1-d2)*game.ballvel[0] 
					game.ballpos[1] = yc+(d1-d2)*game.ballvel[1]
					console.log("hit: ",(game.p1y-yc)/(game.pad[1]/2))
					console.log("angle: ",rebounce_angle)
					console.log("dt: ",d1, "d1:",d2,"dp:",d1-d2)
					console.log("vx:",game.ballvel[0], " vy:", game.ballvel[1], "x:", game.ballpos[0], "y:", game.ballpos[1])
					hit = true
				}
			// level 2
			xc = 401
			yc = m * xc + d
			if ( (game.game_type ===2)
				&& (((xc <= game.ballpos[0]) && (xc >= (game.ballpos[0]+game.ballvel[0]*game.game_vel))) || ((xc >= game.ballpos[0]) && (xc <= (game.ballpos[0]+game.ballvel[0]*game.game_vel)))) // barrier
				&& ( ((yc >= 45) && (yc <= 155)) ||  ((yc >= 350) && (yc <= 450) )  )
				){
					game.ballpos[1] = game.ballpos[1] + game.ballvel[1]*game.game_vel
					let delta = (Math.abs(game.ballvel[0]*game.game_vel) - Math.abs(game.ballpos[0] - xc))
					if ( xc >= game.ballpos[0]) { game.ballpos[0] = xc - delta}
					if ( xc < game.ballpos[0]) { game.ballpos[0] = xc + delta}
					game.ballvel[0] = game.ballvel[0] * -1 
					hit = true
				}
			xc = 599
			yc = m * xc + d
			if ( (game.game_type ===2)
				&& (((xc <= game.ballpos[0]) && (xc >= (game.ballpos[0]+game.ballvel[0]*game.game_vel))) || ((xc >= game.ballpos[0]) && (xc <= (game.ballpos[0]+game.ballvel[0]*game.game_vel)))) // barrier
				&& ( ((yc >= 45) && (yc <= 155)) ||  ((yc >= 350) && (yc <= 450) )  )
				){
					game.ballpos[1] = game.ballpos[1] + game.ballvel[1]*game.game_vel
					let delta = (Math.abs(game.ballvel[0]*game.game_vel) - Math.abs(game.ballpos[0] - xc))
					if ( xc >= game.ballpos[0]) { game.ballpos[0] = xc - delta}
					if ( xc < game.ballpos[0]) { game.ballpos[0] = xc + delta}
					//game.ballpos[0] = xc >= game.ballpos[0] ? xc - delta: xc + delta
					game.ballvel[0] = game.ballvel[0] * -1
					hit = true
				}
				//level 3
				xc = 401
				yc = m * xc + d
				if ( (game.game_type ===3)
					&& (((xc <= game.ballpos[0]) && (xc >= (game.ballpos[0]+game.ballvel[0]*game.game_vel))) || ((xc >= game.ballpos[0]) && (xc <= (game.ballpos[0]+game.ballvel[0]*game.game_vel)))) // barrier
					&& ( ((yc >= 50) && (yc <= 150)) ||  ((yc >= 350) && (yc <= 450) )  )
					){
						game.ballpos[1] = game.ballpos[1] + game.ballvel[1]*game.game_vel
						let delta = (Math.abs(game.ballvel[0]*game.game_vel) - Math.abs(game.ballpos[0] - xc))
						if ( xc >= game.ballpos[0]) { game.ballpos[0] = xc - delta}
						if ( xc < game.ballpos[0]) { game.ballpos[0] = xc + delta}
						//game.ballpos[0] = xc >= game.ballpos[0] ? xc - delta: xc + delta
						game.ballvel[0] = game.ballvel[0] * -1  
						hit = true
					}
				xc = 599
				yc = m * xc + d
				if ( (game.game_type ===3)
					&& (((xc <= game.ballpos[0]) && (xc >= (game.ballpos[0]+game.ballvel[0]*game.game_vel))) || ((xc >= game.ballpos[0]) && (xc <= (game.ballpos[0]+game.ballvel[0]*game.game_vel)))) // barrier
					&& ( ((yc >= 50) && (yc <= 150)) ||  ((yc >= 350) && (yc <= 450) )  )
					){
						game.ballpos[1] = game.ballpos[1] + game.ballvel[1]*game.game_vel
						let delta = (Math.abs(game.ballvel[0]*game.game_vel) - Math.abs(game.ballpos[0] - xc))
						if ( xc >= game.ballpos[0]) { game.ballpos[0] = xc - delta}
						if ( xc < game.ballpos[0]) { game.ballpos[0] = xc + delta}
						game.ballvel[0] = game.ballvel[0] * -1  
						hit = true
					}
			if ( (hit === false) && ((game.ballpos[0] + game.ballvel[0]*game.game_vel) > 990))	{ //goal in p2
				game.p1ptos = game.p1ptos + 1
				game.ballpos[0]=500
				game.ballpos[1]=250 
				let ang = Math.random()*(2) + -1
				game.ballvel=[-Math.cos(ang),Math.sin(ang)]
				game.game_vel = Math.abs(game.game_vel)
				hit = true
			}
			if ( (hit === false) && ((game.ballpos[0] + game.ballvel[0]*game.game_vel) < 10))	{ //goal in p1
				game.p2ptos = game.p2ptos + 1
				game.ballpos[0]=500
				game.ballpos[1]=250
				let ang = Math.random()*(2) + -1
				game.ballvel=[Math.cos(ang),Math.sin(ang)]
				game.game_vel = Math.abs(game.game_vel)
				hit = true
			}
			if (  (hit === false) && (
				((game.ballpos[1] + game.ballvel[1]*game.game_vel) > 500) || ((game.ballpos[1] + game.ballvel[1]*game.game_vel) < 0)))  { //rebote horizontal
				game.ballvel[1] = game.ballvel[1] * -1
			}
			if (hit===false){
				game.ballpos[0] = game.ballpos[0] + game.ballvel[0]*game.game_vel
				game.ballpos[1] = game.ballpos[1] + game.ballvel[1]*game.game_vel
			}

		} 
	  }
    }
    //Sending games to clients
    @Interval(30)
    handleSendingInterval() {
	  this.wss.emit('server-game', {
		command: 'GAME_LIST',
		data: GlobalServiceGames.games,
		timestamp:  Date.now() 
	 	} );	
    }
}
 