import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Función bootstrap que inicia la aplicación NestJS.
async function bootstrap() {
  // Crea una instancia de la aplicación utilizando el módulo principal (AppModule).
  const app = await NestFactory.create(AppModule);

  // Establece un prefijo global para todas las rutas de la aplicación.
  app.setGlobalPrefix('api');

  // Agrega un ValidationPipe global para validar automáticamente los datos de entrada.
  // La opción 'whitelist' elimina las propiedades no permitidas en los DTOs.
  // La opción 'forbidNonWhitelisted' lanza una excepción si se envían propiedades no permitidas.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Inicia la aplicación en el puerto 3000.
  await app.listen(3000);
}

// Llama a la función bootstrap para iniciar la aplicación.
bootstrap();