import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat, ChatUsers } from './entities';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [
    TypeOrmModule.forFeature([Chat, ChatUsers]),
    AuthModule
  ],
})
export class ChatModule {}
