import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entities';
import { ChatUser } from '../chat-user/entities/chat-user.entity';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [
    TypeOrmModule.forFeature([Chat, ChatUser]),
    AuthModule,
  ],
  exports: [ChatService],
})
export class ChatModule {}
