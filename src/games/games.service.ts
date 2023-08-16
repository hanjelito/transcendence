import { Injectable, NotFoundException } from '@nestjs/common';

//import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '../auth/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Games } from './entities/games.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import {GlobalServiceGames} from '../services/games.service'

@Injectable()
export class GamesService {
  
  constructor(
    @InjectRepository(Games)
    private gamesRepository: Repository<Games>,
    //private globalServiceGames: GlobalServiceGames
  )
  {}

  async create(createGameDto: any) {
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
    console.log("prueba list")
    return (GlobalServiceGames.games)
  }
  waitingRoom() {
    console.log("prueba waiting")
    return (GlobalServiceGames.waiting_room)
  }
}