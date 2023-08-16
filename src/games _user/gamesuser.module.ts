import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesUserService } from './gamesuser.service';
import { GamesUserController } from './gamesuser.controller';
import { AuthModule } from 'src/auth/auth.module';
import { GamesUser } from './entities/gamesuser.entity';

@Module({
  controllers: [GamesUserController],
  providers: [GamesUserService],
  imports: [
    TypeOrmModule.forFeature([GamesUser]),
    AuthModule,
  ],
  exports: [GamesUserService],
})
export class GamesUserModule {}
