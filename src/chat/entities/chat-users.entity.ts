import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class ChatUsers
{
	@PrimaryGeneratedColumn()
	id: number;
	
	@Column()
	url: string;

	// many to one relationship with chat
	@ManyToOne(
		() => Chat,
		(chat) => chat.images,
		{ onDelete: 'CASCADE' }
	)
	chat: Chat;



}