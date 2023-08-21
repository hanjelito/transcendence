import { Injectable, Logger, NotFoundException } from '@nestjs/common';

//import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '../auth/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GamesUser } from './entities/gamesuser.entity';
import { User } from '../user/entities/user.entity'
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class GamesUserService {
  private readonly logger = new Logger("Game Logic");
  constructor(
    @InjectRepository(GamesUser)
    //@InjectRepository(User)
    private gamesuserRepository: Repository<GamesUser>,
    //private userRepository: Repository<User>,
  )
  {}

  async create(createGameDto: any) {
    this.logger.log("Estadistica jugador guardada:" + JSON.stringify(createGameDto) );
    return this.gamesuserRepository.save(createGameDto);
    //return `This action create a game` + createGameDto;
  }

  async findAll() {
    const data =  await this.gamesuserRepository.createQueryBuilder("t1")
        .select("SUM(ptos)","Ptos")
        .addSelect("SUM(win)","Wins")
        .addSelect("SUM(los)","Loses")
        .addSelect("SUM(tid)","Tides")
        .addSelect("SUM(goalf)","GF")
        .addSelect("SUM(goalC)","GC")
        //.addSelect("COUNT(player_id)","Games")
        .leftJoin('t1.id', 't2')
        .addSelect(['t2.id,  t2.login','t2.images'])
        //.where('player_id= :playerid', {playerid: id})
        .groupBy("t2.id, t2.login, t2.images")
        .orderBy({
          "SUM(ptos)": "DESC",
          //"user.id": "DESC", 
        })
        .printSql()
        .getRawMany()
    //console.log(data)
    return data
  }
  //https://typeorm.biunav.com/en/select-query-builder.html#how-to-create-and-use-a-querybuilder
  async findBy(id: string) {
    //return this.gamesuserRepository.find(
    //    {where: [{ player_id:id}]})
    const data =  await this.gamesuserRepository.createQueryBuilder("t1")
        .select("SUM(ptos)","Ptos")
        .addSelect("SUM(win)","Wins")
        .addSelect("SUM(los)","Loses")
        .addSelect("SUM(tid)","Tides")
        .addSelect("SUM(goalf)","GF")
        .addSelect("SUM(goalc)","GC")
        //.addSelect("COUNT(player_id)","Games")
        .leftJoin('t1.id', 't2')
        .addSelect(['t2.id,  t2.login','t2.images'])
        .where('t2.id= :playerid', {playerid: id})
        .groupBy("t2.id,t2.login, t2.images")
        .orderBy({
          "SUM(ptos)": "DESC",
          //"user.id": "DESC", 
        })
        .printSql()
        //.getOne()
        .getRawMany()
        //.orderBy({
        //  "user.name": "ASC",
        //  "user.id": "DESC", 
        // })
        console.log(data)
        return data
  }
}