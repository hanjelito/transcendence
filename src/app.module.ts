import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CommonModule } from './common/common.module';
import { ChatUserModule } from './chat-user/chat-user.module';
import { UserModule } from './user/user.module';
import { ContactModule } from './contact/contact.module';
import { MessageWsModule } from './message-ws/message-ws.module';
import { GameWsModule } from './game-ws/game-ws.module';
import { ApiTokenCheckMiddleware } from './common/middleware/api-token-check-middleware';

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
    CommonModule,
    AuthModule,
    ContactModule,
    ChatModule,
    ChatUserModule,
    UserModule,
    MessageWsModule,
    GameWsModule,
    ContactModule,
  ],

  controllers: [],

  // No hay proveedores a nivel de AppModule.
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiTokenCheckMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}