import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { Chat } from '../../chat/entities';
import { User } from '../../user/entities/user.entity';

@Entity()
export class ChatUser
{
	@ApiProperty({
		example: '1',
		description: 'Chat_user Id',
		uniqueItems: true,
	})
	@PrimaryGeneratedColumn()
	id: number;
	
	//
	@ManyToOne(() => Chat,
    (chat) => chat.chatUser,
    { 
        nullable: false,
        onDelete: 'CASCADE',
    })
	@JoinColumn({ name: 'chatId' })
	@IsNotEmpty()
	chat: Chat;

	//
	@ManyToOne(
		() => User,
		( user ) => user.chat,
		{ eager: true },
	)
	user: User;
}
