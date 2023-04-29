import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';
import { CreateUserDto, LoginUserDto } from './dto/';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { GetUser, RawHeaders } from './decorators/';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { Auth, ValidRoles } from './interfaces';

// AuthController es el controlador encargado de gestionar
// las acciones relacionadas con la autenticación.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Ruta de registro de nuevos usuarios.
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  // Ruta para el inicio de sesión de usuarios.
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  // Ruta para verificar el estado de autenticación del usuario.
  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  // Ruta privada de prueba con diferentes decoradores y guardias.
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      message: 'This is a private route',
      user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  // Ruta privada de prueba con protección de roles.
  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  // Ruta privada de prueba con protección de roles utilizando el decorador Auth().
  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}

/**
 Este archivo define el controlador de autenticación, el cual contiene las rutas
 para registrar e iniciar sesión de los usuarios, verificar el estado de
 autenticación y algunas rutas de prueba privadas con protección de roles y
 guardias. Utiliza decoradores personalizados para extraer información del
 usuario y las cabeceras HTTP de las solicitudes.
 */
