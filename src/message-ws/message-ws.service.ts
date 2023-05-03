import { Injectable } from '@nestjs/common';
import { CreateMessageWDto } from './dto/create-message-w.dto';
import { UpdateMessageWDto } from './dto/update-message-w.dto';
import { MessageW } from './entities/message-w.entity';

@Injectable()
export class MessageWsService {

  // create(createMessageWDto: CreateMessageWDto) {
  //   return 'This action adds a new messageW';
  // }
  async create(createMessageWDto: CreateMessageWDto): Promise<MessageW> {
    return 'This action adds a new messageW';
    // Logica para crear el mensaje y guardar en base de datos
    // Devuelve una promesa
  }

  findAll() {
    return `This action returns all messageWs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messageW`;
  }

  update(id: number, updateMessageWDto: UpdateMessageWDto) {
    return `This action updates a #${id} messageW`;
  }

  remove(id: number) {
    return `This action removes a #${id} messageW`;
  }
}
