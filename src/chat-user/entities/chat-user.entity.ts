import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { Chat } from '../../chat/entities';
import { User } from '../../auth/entities/user.entity';

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
	
	@ApiProperty({
		example: 'https://test.tes',
		description: 'url of the chat',
		uniqueItems: true,
	})
	@Column({
		type: 'text',
		nullable: true,
	})
	url: string;


	@ManyToOne(() => Chat,
    (chat) => chat.chatUser,
    { 
        nullable: false,
        onDelete: 'CASCADE',
    })
	@JoinColumn({ name: 'chatId' })
	@IsNotEmpty()
	chat: Chat;

	// @IsNotEmpty()
	// @ManyToOne(() => User,
	// 	(user) => user.chatUser,
	// 	{ 
	// 		nullable: false,
	// 		onDelete: 'CASCADE',
	// 	}
	// )
	// @JoinColumn({ name: 'user_id' })
	// user: User;

	@ManyToOne(
		() => User,
		( user ) => user.chat,
		{ eager: true },
	)
	user: User;
}
