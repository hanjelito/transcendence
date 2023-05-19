// Importaciones necesarias para el servicio.
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';

// Importación de la entidad User.
import { User } from '../../user/entities/user.entity';
import { ChatService } from 'src/chat/chat.service';
import { identity } from 'rxjs';
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
	) { }

	// Función para obtener el nombre completo de un usuario a partir de su socketId.
	async getUserFullName( idUser: string ) {
		try {
			const user: User = await this.userRepository.findOneBy( {id: idUser});
			// Si el cliente no existe, lanza un error.
			if (!user) {
				throw new Error("User not found");
			}
			return user.name + ' ' + user.lastName;
		} catch (error) {
			throw new error;
		}
	}

	async getChat(identifier: string)
	{
		try {
			const chat = await this.chatService.findOnePlain(identifier);
			const filteredChat = this.filterChatFields(chat);
    		return filteredChat;
		} catch (error) {
			throw new error;
		}
	}

	getIDsforSockets(chatId: string)
	{
		const chat = this.getChat(chatId);
		return chat;
		return this.filterChatFieldsSocket(chat);
	}
	// hace un resumen del chat
	filterChatFields(chat) {
		if (!chat) {
			return null;
		}
	
		let chatWithoutUserAndPassword = {...chat};
		let userWithoutSensitiveInfo = {...chat.user};
	
		if (chat.user) {
			const {password, roles, images, isActive, email, ...rest} = chat.user;
			userWithoutSensitiveInfo = rest;
		}
	
		if (chat.password || chat.user) {
			const {password, user, ...rest} = chat;
			chatWithoutUserAndPassword = rest;
		}
	
		// process chatUser array
		if (chat.chatUser) {
			chatWithoutUserAndPassword.chatUser = chat.chatUser.map(chatUser => {
				if (chatUser.user) {
					const {password, roles, images, isActive, email, ...rest} = chatUser.user;
					chatUser.user = rest;
				}
				return chatUser;
			});
		}
	
		return { ...chatWithoutUserAndPassword, user: userWithoutSensitiveInfo };
	}
	// hace un resumen de filterChatFields para sockets
	filterChatFieldsSocket(chat) {
		if (!chat) {
			return null;
		}
	
		let chatWithoutUserAndPassword = {...chat};
		let userWithoutSensitiveInfo = {...chat.user};
	
		if (chat.user) {
			const {password, roles, images, isActive, email, ...rest} = chat.user;
			userWithoutSensitiveInfo = rest;
		}
	
		if (chat.password || chat.user) {
			const {password, user, ...rest} = chat;
			chatWithoutUserAndPassword = rest;
		}
	
		// process chatUser array
		if (chat.chatUser) {
			chatWithoutUserAndPassword.chatUser = chat.chatUser.map(chatUser => {
				if (chatUser.user) {
					const {password, roles, images, isActive, email, ...rest} = chatUser.user;
					return rest.id;  // Return only the user id
				}
				return null;
			}).filter(Boolean);  // Remove any null values
		}
	
		return { ...chatWithoutUserAndPassword, user: userWithoutSensitiveInfo };
	}
	
	
}
