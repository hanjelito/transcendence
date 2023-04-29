import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';

// La clase AppModule es el módulo principal de la aplicación
// y se encarga de importar todos los módulos necesarios.
@Module({
  imports: [
    // ConfigModule se encarga de la configuración global del proyecto.
    ConfigModule.forRoot(),

    // TypeOrmModule se encarga de la configuración de la base de datos.
    // En este caso, se utiliza PostgreSQL.
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),

    // Importa los módulos específicos de la aplicación.
    ChatModule,
    CommonModule,
    AuthModule,
  ],

  // No hay controladores a nivel de AppModule.
  controllers: [],

  // No hay proveedores a nivel de AppModule.
  providers: [],
})
export class AppModule {}