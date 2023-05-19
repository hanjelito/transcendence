import { Module } from '@nestjs/common';

import { MessageWsService } from './services/message-ws.service';
import { MessageWsGateway } from './message-ws.gateway';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { AuthService } from 'src/auth/auth.service';
import { SocketManagerService } from './services';

@Module({
  providers: [MessageWsGateway, MessageWsService, AuthService, SocketManagerService],
  imports: [ AuthModule, ChatModule ],
})

export class MessageWsModule {}
