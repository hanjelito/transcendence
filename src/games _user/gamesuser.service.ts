import { Injectable, NotFoundException } from '@nestjs/common';

//import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '../auth/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GamesUser } from './entities/gamesuser.entity';
import { User } from '../user/entities/user.entity'
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class GamesUserService {
  
  constructor(
    @InjectRepository(GamesUser)
    @InjectRepository(User)
    private gamesuserRepository: Repository<GamesUser>,
    private userRepository: Repository<User>,
  )
  {}

  async create(createGameDto: any) {
    return this.gamesuserRepository.save(createGameDto);
    //return `This action create a game` + createGameDto;
  }

  async findAll() {
    const data =  await this.gamesuserRepository.createQueryBuilder("gamesuser")
    .select('gameuser.player_id')
    .addSelect("SUM(gameuser.ptos)","Ptos")
    .addSelect("SUM(gameuser.win)","Wins")
    .addSelect("SUM(gameuser.los)","Loses")
    .addSelect("SUM(gameuser.tid)","Tides")
    .addSelect("user.id","id")
    //.leftJoinAndSelect('gameuser.user', 'user', 'gameuser.player_id = user.id')
    //.addSelect(['settings.name', 'settings.prop1', 'settings.prop2'])
    //.addSelect("SUM(goalF)","GF")
    //.addSelect("SUM(goalC)","GC")
    //.addSelect("COUNT(player_id)","Games")
    //.where('player_id= :playerid', {playerid: id})
    //.leftJoinAndSelect("user.photos", "photo")
    .groupBy("gameuser.player_id, user.id")
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