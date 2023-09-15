import { Controller, Get, Post, Body, Patch, Param, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth, ValidRoles } from '../auth/interfaces';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { GetUser } from 'src/auth/decorators';
import { multerOptions } from '../services/multer.conf';  // Asegúrate de cambiar 'path/to' al path correcto.
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';


@ApiTags('User')
@Auth(ValidRoles.admin)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('byid/:id')
  updateById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateById(+id, updateUserDto);
  }

  @Patch()
  update(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    return this.userService.update(updateUserDto, user);
  }


  @Patch('upload-image')
@UseInterceptors(FileInterceptor('image', multerOptions))
async uploadImage(
  @UploadedFile() file,
  @GetUser() user: User,
) {
  try {
    // Actualiza el campo images del usuario con la ruta del archivo
    await this.userService.updateUserImage(file.path, user);
    
    return { url: file.path };
  } catch (error) {
    const fs = require('fs');
    fs.unlinkSync(file.path);
    throw error;
  }
}

  @Get('uploads/:filename')
  viewUploadedFile(@Param('filename') filename, @Res() res: Response) {
    const filepath = join(__dirname, '..', '..', 'uploads', filename);
    console.log(filepath);

    if (!existsSync(filepath)) {
      return res.status(404).json({ message: 'File not found.' });
    }

    createReadStream(filepath).pipe(res);
  }
}
