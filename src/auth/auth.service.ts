import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { LoginUserDto, CreateUserDto } from './dto';
import { User } from '../user/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    // Inyecta el repositorio de User y el servicio Jwt.
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Método para iniciar sesión de un usuario.
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    
    // Busca al usuario por su correo electrónico.
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    // Verifica si el correo electrónico y la contraseña coinciden.
    if (!user) throw new UnauthorizedException('Credentials are not valid (email)');
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');

    // Retorna el usuario logueado junto con su token JWT.
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  //login with 42 or create user
  async loginOrCreateWith42( user: any ) {
    const { email, name, lastName, login, password, image } = user;

    // Busca al usuario por su correo electrónico.
    const userDB = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    console.log(image);
    // Verifica si el correo electrónico coincide.
    if (!userDB) {
      // create user
      const newUser = await this.userRepository.save({
        email,
        password,
        name,
        lastName,
        login,
        images: [image.link],
      });

      delete newUser.password;
      // // Retorna el usuario logueado junto con su token JWT.
      return {
        ...newUser,
        token: this.getJwtToken({ id: newUser.id }),
      };
    }

    // Retorna el usuario logueado junto con su token JWT.
    return {
      ...userDB,
      token: this.getJwtToken({ id: userDB.id }),
    };
  }
    
  // Método para verificar el estado de autenticación del usuario.
  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  // Método privado para generar el token JWT.
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  // Método privado para manejar errores de base de datos.
  private handleDBError(error: any): never {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }

  // Método para crear un nuevo usuario.
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      // Crea un nuevo usuario y encripta su contraseña.
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      // Guarda el usuario en la base de datos.
      await this.userRepository.save(user);

      // Elimina la contraseña del objeto user.
      delete user.password;

      // Retorna el usuario creado junto con su token JWT.
      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findOrCreate42User(profile: any): Promise<User> {
    const { id, _json } = profile;
  
    let user = await this.userRepository.findOne({ where: { email: _json.email } });

  
    if (!user) {
      // Crear un nuevo usuario si no existe
      user = this.userRepository.create({
        // Asigne los valores adecuados del perfil a los campos del usuario
        email: _json.email,
        name: _json.first_name,
        lastName: _json.last_name,
      });
  
      await this.userRepository.save(user);
    }
  
    return user;
  }

  async findById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email: userId } });
  
    if (!user) {
      throw new Error(`User not found with ID ${userId}`);
    }
  
    return user;
  }
}

/**
Este archivo define el servicio de autenticación, que contiene métodos
para crear nuevos usuarios, iniciar sesión y verificar el estado de
autenticación de un usuario. También incluye funciones para generar
tokens JWT y manejar errores de base de datos. Utiliza bcrypt para encriptar
las contraseñas de los usuarios.
 */
