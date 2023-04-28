import {
	BeforeInsert, BeforeUpdate,
	Column, Entity,
	OneToMany, PrimaryGeneratedColumn
} from "typeorm";

import { before } from "node:test";
import { Chat } from "../../chat/entities";

@Entity('users')
export class User {
	
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		type: 'text',
		unique: true
	})
	email: string;

	@Column({
		type: 'text',
		select: false
	})
	password: string;

	@Column({
		type: 'text'
	})
	name: string;

	@Column({
		type: 'text'
	})
	lastName: string;

	@Column({
		type: 'boolean',
		default: true,
	})
	isActive: boolean;

	@Column({
		type: 'text',
		array: true,
		default: ['user']
	})
	roles: string[];

	@OneToMany(
		() => Chat,
		( chat ) => chat.user,
	)
	chat: Chat


	@BeforeInsert()
	checkFieldsBeforeInsert()
	{
		this.email = this.email.toLowerCase();
	}

	@BeforeUpdate()
	checkFieldsBeforeUpdate()
	{
		this.checkFieldsBeforeInsert();
	}
}
