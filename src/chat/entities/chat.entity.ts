import {Column, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, OneToMany, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ChatImage } from './chat-iamge.entity';
import { User } from '../../auth/entities/user.entity';

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

	// many to many relationship with chatImage
	@OneToMany(
		() => ChatImage,
		(chatImage) => chatImage.chat,
		// eager: true, call the images when the chat is called
		{cascade: true, eager: true}
	)
	images?: ChatImage[];

	@ManyToOne(
		() => User,
		( user ) => user.chat,
		{ eager: true},
	)
	user: User



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
