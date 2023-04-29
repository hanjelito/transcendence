import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
// Clase para la estrategia de autenticación con JWT.
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
	// Inyecta el repositorio de usuarios.
    @InjectRepository(User)
	// Inyecta el servicio de configuración.
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
	// Configura la estrategia.
    super({
		// Obtiene la clave secreta del archivo de configuración.
    	secretOrKey: configService.get('JWT_SECRET'),
		// Obtiene el token JWT de la cabecera de la petición.
    	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  // Método para validar el token JWT y recuperar el usuario asociado.
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

	// Busca el usuario por su id.
    const user = await this.userRepository.findOneBy({ id });

    // Si el usuario no existe, lanza una excepción de no autorizado.
    if (!user) throw new UnauthorizedException('Token not valid');

    // Si el usuario no está activo, lanza una excepción de no autorizado.
    if (!user.isActive)
      throw new UnauthorizedException(
        'User is not active, talk with an admin',
      );

    // Retorna el usuario si la validación es exitosa.
    return user;
  }
}
