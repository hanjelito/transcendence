import { Module } from '@nestjs/common';
import { GameWsService } from './game-ws.service';
import { GameWsGateway } from './game-ws.gateway';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  providers: [GameWsGateway, GameWsService, AuthService],
  imports: [ AuthModule, ChatModule ],
})
export class GameWsModule {}
