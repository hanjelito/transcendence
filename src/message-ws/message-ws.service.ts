// Importaciones necesarias para el servicio.
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';

// Importación de la entidad User.
import { User } from '../auth/entities/user.entity';
import { ChatService } from '../chat/chat.service';
import { CreateChatDto } from '../chat/dto/create-chat.dto';
import { Chat } from 'src/chat/entities';

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

	// Función para registrar un cliente.
	async registerClient( client: Socket, userId: string )
	{
		// Buscar el usuario en la base de datos.
		const user = await this.userRepository.findOneBy({ id: userId });
		// Si el usuario no se encuentra o no está activo, se lanza un error.
		if( !user ) throw new Error("User not found");
		if( !user.isActive ) throw new Error("User is not active");

		// Si el usuario es válido, se agrega a los clientes conectados.
		this.connectedClients[ client.id ] = {
			socket: client,
			user: user
		};
	}

	// Función para eliminar un cliente.
	removeClient( clientId: string )
	{
		// Eliminar al cliente de los clientes conectados.
		delete this.connectedClients[ clientId ];
	}

	// Función para obtener el número de clientes conectados.
	getConnectedClients():number
	{
		// Retorna el número de claves en el objeto de clientes conectados.
		return Object.keys( this.connectedClients ).length;
	}

	// Función para obtener el nombre completo de un usuario a partir de su socketId.
	async getUserFullName( socketId: string ) {
		try {
			// Si el cliente no existe, lanza un error.
			if (!this.connectedClients[socketId]) {
				throw new Error("User not found");
			}
			// Si el cliente existe, retorna el nombre completo del usuario.
			return this.connectedClients[socketId].user.name + ' ' + this.connectedClients[socketId].user.lastName;
		} catch (error) {
			throw new error;
		}
	}

	// Método para obtener el usuario asociado a un socket.
	async getUserChanelRegister(client: Socket, params: any)
	{
		try {
			const user: User = this.connectedClients[ client.id ].user
			const ChatSend		= new  CreateChatDto();
			let returnchatDto	= new Chat;
			let result;


			ChatSend.name			= params.room;
			ChatSend.description	= params.topic ?? null;
			if ((params.password).length > 1)
			{
				ChatSend.password	= params.password ?? null;
				ChatSend.private	= params.password ? true: false;
			}
			// //
			result  =  await this.chatService.create(ChatSend, user);
			
			//
			if (result.chat.chatUser)
				delete result.chat.chatUser;

			returnchatDto = this.filterChatFields(result.chat);

			return {returnchatDto, register: result.register};
			
			// Emitir un mensaje al servidor con la información del usuario.
		} catch (error) {
			throw new BadRequestException('Error al registrar el usuario en el canal: ' + error.message);
		}
	}

	filterChatFields(chat) {
		const { user, password, ...chatWithoutUserAndPassword } = chat;
		const { password: userPassword, roles, images, isActive, email, ...userWithoutSensitiveInfo } = user;
		return { ...chatWithoutUserAndPassword, user: userWithoutSensitiveInfo };
	  }
}
