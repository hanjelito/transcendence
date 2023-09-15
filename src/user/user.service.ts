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

  updateById(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto, user: User) {
    const foundUser = await this.userRepository.findOneBy({id: user.id});
    
    if (!foundUser) {
        throw new NotFoundException(`User with ID ${user.id} not found`);
    }
    // Actualiza los campos necesarios
    Object.assign(foundUser, updateUserDto);

    // Guarda el usuario actualizado
    const {password, isActive, ...rest} = await this.userRepository.save(foundUser);
    return rest;
  }

  async updateUserImage(imagePath: string, user: User) {
    const foundUser = await this.userRepository.findOneBy({id: user.id});
    
    if (!foundUser) {
        throw new NotFoundException(`User with ID ${user.id} not found`);
    }
    // Actualiza el campo images del usuario
    foundUser.images = imagePath;
  
    await this.userRepository.save(foundUser);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
