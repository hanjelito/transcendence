//import {GameDto} from './dto/game.dto'
import { Injectable} from '@nestjs/common';

@Injectable()
export class GlobalServiceGames{ 
    static games:any [] = [1]; 
 }