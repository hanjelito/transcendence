// Importaciones necesarias para el servicio.
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';

// Importación de la entidad User.
import { User } from '../../user/entities/user.entity';
import { ChatService } from 'src/chat/chat.service';
import { ChatUserService } from 'src/chat-user/chat-user.service';
import { SocketManagerService } from './socketManager-ws.service';
// import { Chat } from 'src/chat/entities';

// Definición de la interfaz ConnectClient.
interface ConnectClient {
	[id: string]:{
		socket: Socket,
		user: User
	}
}

// Decorador para indicar que esta clase es un proveedor de servicio en NestJS.
@Injectable()
export class MessageWsService {

	// Almacén de clientes conectados.
	private connectedClients: ConnectClient = {};

	// Inyección de dependencias en el constructor.
	constructor(
		// Inyección del repositorio para la entidad User.
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly chatService: ChatService,
		private readonly chatUserService: ChatUserService,
		//
		private readonly socketManagerService: SocketManagerService,
	) { }

	async getUserFullData( idUser: string ) {
		try {
			const user: User = await this.userRepository.findOneBy( {id: idUser});
			// Si el cliente no existe, lanza un error.
			if (!user) {
				throw new Error("User not found");
			}

			return {
				id: user.id,
				name: user.name,
				lastName:user.lastName,
				login:user.login,
			};
		} catch (error) {
			throw new error;
		}
	}

	//TODO 	terminar el return de todos los usuarios de chat que estan conectados en ese canal
	async getChatWhithId(chatId: string)
	{
		const chat = await this.getChat(chatId);
		return chat;
	}

	async getChat(identifier: string)
	{
		try {
			const chaUser = await this.chatUserService.findOneChatUserByIdentifier(identifier);
    		return chaUser;
		} catch (error) {
			throw new error;
		}
	}
	// TODO arreglar esto no funciona no filtra
	async getActiveChatUsers(params) {
		// Obtén todos los usuarios del chat basado en los parámetros.
		const chatUsers = await this.getChatWhithId(params);

		// Conviértelo a un array para facilitar el manejo.
		const chatUsersArray = Object.values(chatUsers);

		// Obtén todos los clientes actualmente conectados.
		const allClients = this.socketManagerService.getAllClients();

		// Filtra los clientes para solo aquellos cuyo userId está en chatUsersArray.
		const filteredClients = allClients.filter(client =>
			chatUsersArray.some(chatUser => chatUser.userId === client.userId)
		);

		// Mapear los clientes filtrados en un formato que muestre solo el userId y los clientIds
		const result = filteredClients.map(client => {
			return {
			userId: client.userId,
			clientIds: client.clientIds
			};
		});

		return result;
	}
}
