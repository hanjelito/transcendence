import { Transform } from "class-transformer";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDto
{
	@IsString()
	@IsEmail()
	//TODO: Change to lowercase in entity
	@Transform(({ value }) => value.toLowerCase())
	email: string;

	@IsString()
	@MinLength(6)
	@MaxLength(20)
	@Matches(
		/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'The password must have a Uppercase, lowercase letter and a number'
	})
	password: string;
}