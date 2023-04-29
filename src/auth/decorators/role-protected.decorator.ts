import { SetMetadata } from '@nestjs/common';
import { ValidRoles, JwtPayload } from '../interfaces';

// Constante META_ROLES que contiene la clave de metadatos para almacenar roles.
export const META_ROLES = 'roles';

// Función decoradora RoleProtected para proteger rutas basadas en roles de usuario.
export const RoleProtected = (...args: string[]) => {
  // Almacena los roles proporcionados en los metadatos del controlador o método.
  return SetMetadata(META_ROLES, args);
};

/**
Este archivo define la función decoradora RoleProtected, que se utiliza para
proteger rutas basadas en roles de usuario. La función toma una lista de roles
válidos como argumento y almacena los roles proporcionados en los metadatos del
controlador o método.
*/