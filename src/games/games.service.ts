import { Injectable, Logger, NotFoundException } from '@nestjs/common';

//import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '../auth/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Games } from './entities/games.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import {GlobalServiceGames} from '../services/games.service'
import { ExceptionService } from '../services/exception.service';

@Injectable()
export class GamesService {
  private readonly logger = new Logger("Game Logic");
  constructor(
    @InjectRepository(Games)
    private gamesRepository: Repository<Games>,
    private exceptionService: ExceptionService,
    //private globalServiceGames: GlobalServiceGames
  )
  {}

  async create(createGameDto: any) {
    try {
      this.logger.log("Juego guardado:" + JSON.stringify(createGameDto) );
      return this.gamesRepository.save(createGameDto);
    } catch (error) {
          this.exceptionService.handleDBExceptions(error);
    }
  }

  async findAll() {
    try {
      return(GlobalServiceGames.waiting_room)
    } catch (error) {
      this.exceptionService.handleDBExceptions(error);
    }
  }
  
  async findBy(id: string) {
    try {
      return this.gamesRepository.find(
          {where: [{ p1_id:id}, 
                  {p2_id:id}]})
    } catch (error) {
      this.exceptionService.handleDBExceptions(error);
    }
  }
  liveGamesList() {
    try {
      return (GlobalServiceGames.games)
    } catch (error) {
      this.exceptionService.handleDBExceptions(error);
    }  
  }
  waitingRoom() {
    try {
      return (GlobalServiceGames.waiting_room)
    } catch (error) {
      this.exceptionService.handleDBExceptions(error);
    }  
  }
}