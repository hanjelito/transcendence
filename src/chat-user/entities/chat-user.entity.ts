import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Chat } from '../../chat/entities';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class ChatUser
{
	@PrimaryGeneratedColumn()
	id: number;
	
	@Column({
		type: 'text',
		nullable: true,
	})
	url: string;

	@IsNotEmpty()
	@ManyToOne(() => Chat,
		(chat) => chat.chatUser,
		{ 
			nullable: false,
			onDelete: 'CASCADE',
		})
	@JoinColumn({ name: 'chat_id' })
	chat: Chat;


	@IsNotEmpty()
	@ManyToOne(() => User,
		(user) => user.chatUser,
		{ 
			nullable: false,
			onDelete: 'CASCADE',
		}
	)
	@JoinColumn({ name: 'user_id' })
	user: User;
}
