//import {GameDto} from './dto/game.dto'
import { Injectable} from '@nestjs/common';

@Injectable()
export class GlobalServiceGames{ 
    static games:any [] = [];
    /*  
    [ {
          game_id:1,
          game_status:0,
          game_count: 30,
          game_type: 2, 
          game_vel: 20,
          ballpos:[500,250],
          ballvel:[1,1],
          ballrad: 5,
          p1nick:'tester',
          p1id:'deefc7f9-5a5d-42e3-9110-5be31fcbf7bd',
          p1y:250,
          p1ptos:0,
          p1_state: false,
          p2nick:'tester2',
          p2id:'9f6443c9-5397-4bc5-9cc3-245e2c720cc9',
          p2y:250, 
          p2ptos:0,
          p2_state: false, 
          pad:[5,100],      
        },{
          game_id:2, 
          game_status:1,
          game_count: 5,
          game_type: 2,
          game_vel: 1,
          ballpos:[200,200],
          ballvel:[1,1],
          ballrad: 5,
          p1nick:'Daniel2',
          p1id:'31341',
          p1y:250,
          p1ptos:10,
          p1_state: true,
          p2nick:'Opponent2',
          p2id:'eqe2e32',
          p2y:250,
          p2ptos:5,
          p2_state: true,
          pad:[5,50],        
        },{
          game_id:3,
          game_status:1,
          game_count: 5,
          game_type: 3,
          game_vel: 1,
          ballpos:[200,200],
          ballvel:[1,1],
          ballrad: 5,
          p1nick:'Daniel',
          p1id:'5e9e3eb6-f43a-4d35-a03f-bf04519bbec7',
          p1y:250,
          p1ptos:10,
          p1_state: true,
          p2nick:'Opponent',
          p2id:'eqe2e32',
          p2y:250,
          p2ptos:5,
          p2_state: true,
          pad:[5,50],        
        }
      ];
    */
    static game_cfg: any = {  ///default configuration
      pad:[5,100],
      ballrad: 5,
      game_vel: 20,
      time_wait: 15,
      time_start: 5,
      time_play: 60,
      time_show: 10,
    };
    static waiting_room: any = null
 } 