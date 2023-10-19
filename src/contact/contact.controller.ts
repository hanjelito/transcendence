import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { Auth, ValidRoles } from '../auth/interfaces';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateContactUserBlockDto } from './dto/block_user/update-contactUserBlock.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/auth/decorators';

@ApiTags('Contact')
@Auth(ValidRoles.admin)
@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService
  ) {}

  // block

  @Patch('/block-user')
  updateContactUserBlock(
    @Body() updateContactUserBlockDto: UpdateContactUserBlockDto,
    @GetUser() user: User,
  ) {
    return this.contactService.updateContactUserBlock(updateContactUserBlockDto, user);
  }
  
  @Get('/block-user')
  getBlockedUsers(
    @GetUser() user: User,
  ) {
    return this.contactService.getBlockedUsers(user);
  }
  //

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

  @Get('dual/:id')
  findOneDual(@Param('id') id: string) {
    return this.contactService.findOneDual(id);
  }

  // @Patch()
  // update(
  //   @Body() updateContactDto: UpdateContactDto,
  //   @GetUser() user: User,
  // ) {
  //   return this.contactService.update(updateContactDto, user);
  // }

  @Delete()
  remove(
    @Body() deleteContactDto: CreateContactDto,
    @GetUser() user: User,
  ) {
    return this.contactService.remove(deleteContactDto, user);
  }

  
}

