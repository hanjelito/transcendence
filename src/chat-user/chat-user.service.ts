import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EntityNotFoundError, Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';

import { CreateChatUserDto } from './dto/create-chat-user.dto';

import { User } from '../user/entities/user.entity';
import { Chat } from '../chat/entities';
import { ChatUser } from './entities/chat-user.entity';
import { ExceptionService } from '../services/exception.service';

@Injectable()
export class ChatUserService {

	private readonly logger = new Logger('ChatService');
	
	constructor(
	@InjectRepository(Chat)
	private chatRepository: Repository<Chat>,
		
	@InjectRepository(ChatUser)
	private chatUsersRepository: Repository<ChatUser>,

	private readonly exceptionService: ExceptionService,


	) {}

	async create(createChatUserDto: CreateChatUserDto, user: User) {
		try {
			const { chatId, ...chatUserDetails } = createChatUserDto;
			
			if (!isUUID(chatId))
			throw new NotFoundException(`Chat with id ${chatId} not founds`);
		
			const chat = await this.chatRepository.findOneBy({ id: chatId });
		
			if (!chat) 
				throw new NotFoundException(`Chat with id ${chatId} not found`);
		
			// Buscar un registro existente con el mismo chatId y userId
			const existingChatUser = await this.chatUsersRepository.findOneBy({ chat: { id: chatId }, user: { id: user.id } });
		
			if (existingChatUser) {
				return {
					message: "Canal existente",
					status: false,
					channel: existingChatUser
				};
			}

			const chatUser = this.chatUsersRepository.create(chatUserDetails);
			chatUser.chat = chat;
			chatUser.user = user;
		
			await this.chatUsersRepository.save(chatUser);

			// retorna el chatUser creado con el usuario y el chat
			return {
				message: "Canal nuevo",
				status: true,
				channel: chatUser
			};

		} catch (error) {
			// si el error es de tipo EntityNotFoundError, lanzar un error 404
			if (error instanceof EntityNotFoundError) {
				this.exceptionService.handleNotFoundException('Chat not found', `Chat with id not found.`);
			} else {
				// si no, lanzar un error
				this.exceptionService.handleDBExceptions(error);
			}
		}
	}

	//plain chatUsers call controller
	// async findOnePlain( term: string )
	// {
	// 	const { ...rest } = await this.findOne( term );
	// 	return {
	// 		...rest
	// 	}
	// }

	async findOneChatUserByIdentifier(identifier: string)
	{
		
		if (isUUID(identifier)) {


			
			const chatUsers = await this.chatUsersRepository
			.createQueryBuilder('chatUser')
			.select('chatUser.chat.id', 'chatId') 
			.addSelect('chatUser.user.id', 'userId') 
			.innerJoin('chatUser.chat', 'chat')
			.innerJoin('chatUser.user', 'user')
			.where('chat.id = :chatId', { chatId: identifier })
			.getRawMany();
			
			
			if (!chatUsers) {
				throw new NotFoundException(`Chat with id	${ identifier } not found`);
			}
			const chatUsersArray = Object.values(chatUsers);
			return {
				...chatUsersArray
			};
		}
		return null;
	}

	async findOneChatUserByIdentifierDetail(identifier: string): Promise<any[]> {
		if (isUUID(identifier)) {
			const chatUsers: ChatUser[] = await this.chatUsersRepository.find({
			where: {
				chat: { id: identifier }
			},
			select: ['chat', 'user']
			});
			
			if (chatUsers.length === 0) {
			throw new NotFoundException(`Chat with id ${identifier} not found`);
			}
		
			const chatUserDAta = chatUsers.map(chatUser => ({
			id: chatUser.id,
			rol: chatUser.rol,
			created_at: chatUser.created_at,
			user: {
				id: chatUser.user.id,
				login: chatUser.user.login,
				roles: chatUser.user.roles,
				images: chatUser.user.images
			}
			}));
			const chatUsersArray = Object.values(chatUserDAta);
			return {
				...chatUsersArray
			};
		}
		return [];
	  }

	async findAllChatsByUserId(identifier: string)
	{
		if (isUUID(identifier)) {
			const chatUsers = await this.chatUsersRepository
			.createQueryBuilder('chatUser')
			.select('chat.id', 'chatId') // Adjusted this line
			.addSelect('chat.name', 'chatName')  // Adjusted this line
			.addSelect('user.id', 'userId') // Adjusted this line
			.innerJoin('chatUser.chat', 'chat')
			.innerJoin('chatUser.user', 'user')
			.where('user.id = :userId', { userId: identifier })
			.getRawMany();

			
			
			if (!chatUsers || chatUsers.length === 0) {
				return [];
			}
			const chatUsersArray = Object.values(chatUsers);
			return {
				...chatUsersArray
			};
		}
		return null;
	}


}
