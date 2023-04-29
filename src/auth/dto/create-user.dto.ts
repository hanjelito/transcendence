import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

// Clase CreateUserDto para la validación de los datos del usuario al registrarse.
export class CreateUserDto {
	
	@IsString()
	@IsEmail()
	// Propiedad email del usuario que debe ser una cadena de caracteres y un correo electrónico válido.
	email: string;

	@IsString()
	@MinLength(6)
	@MaxLength(20)
	// Propiedad password del usuario que debe ser una cadena de caracteres y tener una longitud mínima de 6 y máxima de 20.
	@Matches(
		/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'The password must have a Uppercase, lowercase letter and a number'
	})
	// Propiedad password del usuario que debe ser una cadena de caracteres,
	// con una longitud entre 6 y 20 caracteres,
	// y contener al menos una letra mayúscula, una letra minúscula y un número.
	password: string;

	@IsString()
	@MinLength(5)
	// Propiedad name del usuario que debe ser una cadena de caracteres con una longitud mínima de 5 caracteres.
	name: string;

	@IsString()
	@MinLength(5)
	// Propiedad lastName del usuario que debe ser una cadena de caracteres con una longitud mínima de 5 caracteres.
	lastName: string;

	@IsString()
	@MinLength(5)
	// Propiedad user del usuario que debe ser una cadena de caracteres con una longitud mínima de 5 caracteres.
	login: string;
}

/**
Este archivo define la clase CreateUserDto, que se utiliza para validar los datos
del usuario al registrarse. La clase contiene las propiedades email, password,
name y lastName, que deben ser cadenas de caracteres y cumplir con las restricciones
de validación definidas en cada una de ellas.
*/