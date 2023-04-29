import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';

// Función decoradora Auth que aplica protección de roles y guarda el estado del usuario.
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    // Aplica el decorador RoleProtected con los roles proporcionados.
    RoleProtected(...roles),
    // Aplica UseGuards con AuthGuard y UserRoleGuard.
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}

/**
Este archivo define la función decoradora Auth, que se utiliza para aplicar
protección de roles y guarda el estado del usuario en los controladores. La 
función toma una lista de roles válidos como argumento y aplica los decoradores
RoleProtected y UseGuards con AuthGuard y UserRoleGuard.
 */