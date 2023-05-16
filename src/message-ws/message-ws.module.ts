import { Module } from '@nestjs/common';

import { MessageWsService } from './message-ws.service';
import { MessageWsGateway } from './message-ws.gateway';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [MessageWsGateway, MessageWsService, AuthService],
  imports: [ AuthModule, ChatModule ],
})

export class MessageWsModule {}
