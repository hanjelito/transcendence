import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '../auth/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class UserService {
  
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
  )
  {}

  async create(createUserDto: CreateUserDto) {
    return `This action returns all user`;
  }

  async findAll() {
    const user = await this.userRepository.find();

    return user.map( ({ ...res }) =>({
        ...res
    })) ;
  }

  async findOne(identifier: string) {
    let user: User;
    if (isUUID(identifier))
      user = await this.userRepository.findOneBy( {id: identifier} );
    
    if (!user) {
        throw new NotFoundException(`User with id	${ identifier } not found`);
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
