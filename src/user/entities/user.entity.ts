import {
	BeforeInsert, BeforeUpdate,
	Column, Entity,
	JoinColumn,
	ManyToOne,
	OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { Chat } from "../../chat/entities";
import { ChatUser } from "../../chat-user/entities/chat-user.entity";
import { Contact } from "../../contact/entities/contact.entity";


// @Entity() define la clase como una entidad de TypeORM.
// Clase User que representa la entidad de usuario en la base de datos.
@Entity('users')
export class User {
	
	
	@ApiProperty({
		example: '746ef755-a990-46b8-8b4b-feb1be6cb46c',
		description: 'User Id',
		uniqueItems: true,
	})
	@PrimaryGeneratedColumn('uuid')
	// Propiedad id del usuario que es un identificador único generado automáticamente.
	id: string;

	@ApiProperty({
		example: 'tester@tester.com',
		description: 'email of the user login',
		uniqueItems: true,
	})
	@Column({
		type: 'text',
		unique: true,
		
	})
	// Propiedad email del usuario que debe ser una cadena de caracteres y un correo electrónico válido.
	email: string;

	// Propiedad user del usuario, de tipo texto y único.
	@ApiProperty({
		example: 'login user name',
		description: 'Chat Id',
		uniqueItems: true,
	})
	@Column({
		type: 'text',
		unique: true,
	})
	login: string;

	// Propiedad imagenes del usuario, de tipo texto.
	@ApiProperty({
		example: '[	"image1.jpg",	"image2.jpg",	"image3.jpg"]',
		description: 'images of the user avatar',
	})
	@Column({
		type: 'text',
		array: true,
		default: []
	})
	// Propiedad images del usuario, que es un array de tipo texto, con un valor predeterminado de [].
	images: string[];

	@ApiProperty({
		example: 'Password1234',
		description: 'password of the user login',
	})
	@Column({
		type: 'text'
	})
	// Propiedad password del usuario, de tipo texto y no se selecciona por defecto en las consultas.
	password: string;

	@ApiProperty({
		example: 'jhon',
		description: 'Name of the user',
	})
	@Column({
		type: 'text'
	})
	// Propiedad name del usuario, de tipo texto.
	name: string;

	@ApiProperty({
		example: 'smith collins',
		description: 'Last Name of the user',
	})
	@Column({
		type: 'text'
	})
	// Propiedad lastName del usuario, de tipo texto.
	lastName: string;

	@ApiProperty({
		example: 'true',
		description: 'Is active user',
		default: true,
	})
	@Column({
		type: 'boolean',
		default: true,
	})
	// Propiedad isActive del usuario, de tipo booleano, con un valor predeterminado de 'true'.
	isActive: boolean;

	@ApiProperty({
		example: '["admin", "user", "superuser""]',
		description: 'Roles of the user',
	})
	@Column({
		type: 'text',
		array: true,
		default: ['user'],
		// select: false // si se muestra en el resultado
	})
	// Propiedad roles del usuario, que es un array de tipo texto, con un valor predeterminado de ['user'].
	roles: string[];

	@ApiProperty()
	@OneToMany(
		() => Chat,
		( chat ) => chat.user,
	)
	// Relación uno a muchos entre el usuario y el chat.
	chat: Chat

	@ApiProperty()
	@OneToMany(
		() => ChatUser,
		( chatUsers ) => chatUsers.user,
	)
	chatUser: ChatUser


	@OneToMany(() => Contact, contact => contact.user, {
		cascade: true,
	})
  	contacts: Contact[];

	// Método que se ejecuta antes de insertar un nuevo registro de usuario en la base de datos.
	// Convierte el email a minúsculas.
	@BeforeInsert()
	checkFieldsBeforeInsert()
	{
		this.email = this.email.toLowerCase();
	}

	// Método que se ejecuta antes de actualizar un registro de usuario en la base de datos.
	// Convierte el email a minúsculas.
	@BeforeUpdate()
	checkFieldsBeforeUpdate()
	{
		this.checkFieldsBeforeInsert();
	}
}