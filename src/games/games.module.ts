import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Games } from './entities/games.entity';
import { GlobalServiceGames} from '../services/games.service'
@Module({
  controllers: [GamesController],
  providers: [GamesService, GlobalServiceGames],
  imports: [
    TypeOrmModule.forFeature([Games]),
    AuthModule
  ],
  exports: [GamesService],
})
export class GamesModule {}
