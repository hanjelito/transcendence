import { Module } from '@nestjs/common';

import { MessageWsService } from './services/message-ws.service';
import { MessageWsGateway } from './message-ws.gateway';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../user/user.module';

import { AuthService } from 'src/auth/auth.service';
import { ChatMessageWsService, SocketManagerService } from './services';

@Module({
  providers: [MessageWsGateway, MessageWsService, AuthService, SocketManagerService, ChatMessageWsService],
  imports: [ AuthModule, ChatModule, UserModule ],
})

export class MessageWsModule {}
