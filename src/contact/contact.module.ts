import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ExceptionService } from 'src/services/exception.service';
import { Contact } from './entities/contact.entity';
import { SocketManagerService } from '../message-ws/services/socketManager-ws.service';

@Module({
  controllers: [ContactController],
  providers: [
    ContactService, 
    ExceptionService, 
    SocketManagerService
  ],
  imports: [
    TypeOrmModule.forFeature([Contact, User]),
    //muy importante para usar el auth() en el controller
    AuthModule,
  ],
  exports: [ContactService],
})
export class ContactModule {}
