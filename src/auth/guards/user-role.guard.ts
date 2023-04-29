import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { META_ROLES } from '../decorators/role-protected.decorator';

//Guardia de roles de usuario
@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
  )
  {}

  // canActivate() es el método que se ejecuta antes de que se ejecute el controlador.
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Obtiene los roles válidos para el controlador.
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler() );

    // Si no hay roles válidos, se permite el acceso.
    if ( !validRoles ) return true;
    // Si hay roles válidos, se comprueba si el usuario tiene alguno de ellos.
    if ( validRoles.length === 0 ) return true;

    // Obtiene el usuario de la petición.
    const request = context.switchToHttp().getRequest();
    //
    const user = request.user;

    // Si no hay usuario, se lanza una excepción.
    if (!user)
      throw new BadRequestException('User nor found');

    // Si el usuario tiene alguno de los roles válidos, se permite el acceso.
    for (const role of user.roles)
    {
      if (validRoles.includes( role ))
        return true;
    }
    
    // Si el usuario no tiene ninguno de los roles válidos, se lanza una excepción.
    throw new ForbiddenException(
      `User ${ user.name } need a valid role: [${ validRoles }]`
    );

    return true;
  }
}
