import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth, ValidRoles } from '../auth/interfaces';
import { GamesService } from './games.service';
//import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Games')
@Auth(ValidRoles.admin)
@Controller('games')
export class GamesController {
    constructor(
        private readonly gamesService: GamesService,
    ) {}
    @Post()
    create(@Body() createGameDto: any) {
        return this.gamesService.create(createGameDto);
    }

    @Get()
    findAll() {
      return ("test")
      return this.gamesService.findAll();
    }

    @Get('listlivegames')
    liveGamesList() {
      return this.gamesService.liveGamesList();
    }

    @Get('roomwaiting')
    waitingRoom() {
      return (this.gamesService.waitingRoom());
    }

    @Get(':id')
    findBy(@Param('id') id: string) {
      return this.gamesService.findBy(id);
    }


}