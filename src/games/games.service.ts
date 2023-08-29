import { Injectable, Logger, NotFoundException } from '@nestjs/common';

//import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '../auth/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Games } from './entities/games.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import {GlobalServiceGames} from '../services/games.service'

@Injectable()
export class GamesService {
  private readonly logger = new Logger("Game Logic");
  constructor(
    @InjectRepository(Games)
    private gamesRepository: Repository<Games>,
    //private globalServiceGames: GlobalServiceGames
  )
  {}

  async create(createGameDto: any) {
    this.logger.log("Juego guardado:" + JSON.stringify(createGameDto) );
    return this.gamesRepository.save(createGameDto);
    //return `This action create a game` + createGameDto;
  }

  async findAll() {
    //console.log("prueba")
    //console.log(GlobalServiceGames.games)
    return(GlobalServiceGames.waiting_room)
    //return this.gamesRepository.find()
  }
  
  async findBy(id: string) {
    return this.gamesRepository.find(
        {where: [{ p1_id:id}, 
                 {p2_id:id}]})
  }
  liveGamesList() {
    return (GlobalServiceGames.games)
  }
  waitingRoom() {
    return (GlobalServiceGames.waiting_room)
  }
}