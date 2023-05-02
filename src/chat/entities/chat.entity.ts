import {Column, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, OneToMany, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../auth/entities/user.entity';
import { ChatUser } from 'src/chat-user/entities/chat-user.entity';

@Entity()
export class Chat {
	
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column('text', {
		unique: true,
	})
	name: string;

	@Column({
		type: 'text',
		nullable: true,
	})
	description: string;

	@Column('boolean', {
		default: false,
	})
	private: boolean;

	@Exclude()
	@Column({
		type: 'text',
		unique: true,
	})
	slug: string;

	@Column({
		type: 'text',
		nullable: true,
	})
	password: string;

	// many to many relationship with chatUsers
	@OneToMany(
		() => ChatUser,
		(chatUsers) => chatUsers.chat,
		// eager: true, call the images when the chat is called
		{ cascade: true, eager: true }
	)
	chatUser: ChatUser[];

	@ManyToOne(
		() => User,
		( user ) => user.chat,
		{ eager: true },
	)
	user: User;
	

	// @Column('text', {
	// 	array: true,
	// })
	// size: string[];
	@BeforeInsert()
	checkSlugIsert() {
		if (!this.slug) {
			this.slug = this.name;
		}
		
		this.slug = this.slug.replace(/\s/g, '-').toLowerCase();
	}

	@BeforeUpdate()
	checkSlugUpdate() {		
		this.slug = this.name
		.replaceAll(' ', '-')
		.replaceAll("'", '')
		.toLowerCase();
	}
}
