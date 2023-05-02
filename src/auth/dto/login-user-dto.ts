import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

// Clase LoginUserDto para la validación de los datos del usuario al iniciar sesión.
export class LoginUserDto
{
	@ApiProperty({
		description: 'Email',
		maxLength: 30,
	})
	@IsString()
	@IsEmail()
	@Transform(({ value }) => value.toLowerCase())
	// Propiedad email del usuario que debe ser una cadena de caracteres y un correo electrónico válido.
	// Transforma el valor de la propiedad email a minúsculas.
	email: string;

	@ApiProperty({
		description: 'Password',
		maxLength: 30,
		format: 'password',
	})
	@IsString()
	@MinLength(6)
	@MaxLength(20)
	@Matches(
		/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'The password must have a Uppercase, lowercase letter and a number'
	})
	// Propiedad password del usuario que debe ser una cadena de caracteres,
	// con una longitud entre 6 y 20 caracteres,
	// y contener al menos una letra mayúscula, una letra minúscula y un número.
	password: string;
}

/**
Este archivo define la clase LoginUserDto, que se utiliza para validar los datos
del usuario al iniciar sesión. La clase contiene las propiedades email y password,
que deben ser cadenas de caracteres y cumplir con las restricciones de validación
definidas en cada una de ellas.
 */