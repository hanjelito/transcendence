import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { Auth, ValidRoles } from '../auth/interfaces';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/auth/decorators';

@ApiTags('Contact')
@Auth(ValidRoles.admin)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(
    @Body() createContactDto: CreateContactDto,
    @GetUser() user: User,
  ) {
    return this.contactService.create(createContactDto, user);
  }

  // @Get()
  // findAll() {
  //   return this.contactService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
  //   return this.contactService.update(+id, updateContactDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.contactService.remove(+id);
  // }
}
