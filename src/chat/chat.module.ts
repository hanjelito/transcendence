import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat, ChatImage } from './entities';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [
    TypeOrmModule.forFeature([Chat, ChatImage]),
    AuthModule
  ],
})
export class ChatModule {}
