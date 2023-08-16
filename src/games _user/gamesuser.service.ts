import { Injectable, NotFoundException } from '@nestjs/common';

//import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '../auth/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GamesUser } from './entities/gamesuser.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class GamesUserService {
  
  constructor(
    @InjectRepository(GamesUser)
    private gamesuserRepository: Repository<GamesUser>,
    
  )
  {}

  async create(createGameDto: any) {
    return this.gamesuserRepository.save(createGameDto);
    //return `This action create a game` + createGameDto;
  }

  async findAll() {
    const data =  await this.gamesuserRepository.createQueryBuilder()
    .select('player_id')
    .addSelect("SUM(ptos)","Ptos")
    .addSelect("SUM(win)","Wins")
    .addSelect("SUM(los)","Loses")
    .addSelect("SUM(tid)","Tides")
    //.addSelect("SUM(goalF)","GF")
    //.addSelect("SUM(goalC)","GC")
    //.addSelect("COUNT(player_id)","Games")
    //.where('player_id= :playerid', {playerid: id})
    .groupBy("player_id")
    .printSql()
    .orderBy({
      "SUM(ptos)": "DESC",
     })
    .getRawMany()
    console.log(data)
    return data
  }
  //https://typeorm.biunav.com/en/select-query-builder.html#how-to-create-and-use-a-querybuilder
  async findBy(id: string) {
    //return this.gamesuserRepository.find(
    //    {where: [{ player_id:id}]})
    const data =  await this.gamesuserRepository.createQueryBuilder()
        .select('player_id')
        .addSelect("SUM(ptos)","Ptos")
        .addSelect("SUM(win)","Wins")
        .addSelect("SUM(los)","Loses")
        .addSelect("SUM(tid)","Tides")
        //.addSelect("SUM(goalF)","GF")
        //.addSelect("SUM(goalC)","GC")
        //.addSelect("COUNT(player_id)","Games")
        .where('player_id= :playerid', {playerid: id})
        .groupBy("player_id")
        .printSql()
        .getRawMany()
        //.orderBy({
        //  "user.name": "ASC",
        //  "user.id": "DESC", 
        // })
        console.log(data)
        return data
  }
}