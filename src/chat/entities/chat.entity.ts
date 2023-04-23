import { Exclude } from 'class-transformer';
import {Column, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from 'typeorm';

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
