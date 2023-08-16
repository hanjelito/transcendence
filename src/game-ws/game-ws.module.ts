import { Module } from '@nestjs/common';
import { GameWsService } from './game-ws.service';
import { GameWsGateway } from './game-ws.gateway';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { ChatModule } from 'src/chat/chat.module';
import {GamesModule} from '../games/games.module'
import {GamesUserModule} from '../games _user/gamesuser.module'

@Module({
  providers: [GameWsGateway, GameWsService, AuthService],
  imports: [ AuthModule, ChatModule, GamesModule, GamesUserModule],
})
export class GameWsModule {}
