import { Controller, Get, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { CreateUserDto, LoginUserDto } from './dto/';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { GetUser } from './decorators/';

import { Auth } from './interfaces';


@ApiTags('Login Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  

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

  
  @Get('42')
  @UseGuards(AuthGuard('42'))
  fortyTwoLogin() {
    // Inicia el proceso de autenticación con 42
  }
  
  // @Get('42/callback')
  // @UseGuards(AuthGuard('42'))
  // fortyTwoCallback(@Req() req: Request) {
  //   console.log('test callback controller');
  //   const user = req.user;
  //   const jwt: any = this.authService.loginOrCreateWith42(user);
  //   return jwt;
  // }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  fortyTwoCallback(@Req() req: Request, @Res() res: Response) {
    console.log('test callback controller');
    const user = req.user;
    this.authService.loginOrCreateWith42(user).then(jwt => {
      console.log(jwt.token);

      // Establecer el token en una cookie HTTP segura.
      res.cookie('auth_token', jwt.token, {
        httpOnly: true,
        secure: true, // Utiliza esto sólo en producción con HTTPS
        // ... otros parámetros de configuración de la cookie si es necesario
      });

      // Redirige al usuario.
      return res.redirect('http://localhost:8080/dashboard');
    });
  }

  // @Get('42/callback')
  // @UseGuards(AuthGuard('42'))
  // fortyTwoCallback(@Req() req: Request, @Res() res: Response) {
  //   console.log('test callback controller');
  //   const user = req.user;
  //   const jwt: any = this.authService.loginOrCreateWith42(user);
  //   return jwt;

  //   // Redirige al usuario de vuelta al frontend con el token.
  //   return res.redirect(`http://localhost:8080/?token=${jwt}`);
  // }
}