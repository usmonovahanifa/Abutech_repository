import { UpdateUserDto } from '@dtos'
import { VerifyRoleGuard, VerifyTokenGuard } from '@guards'
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
  Req,
  InternalServerErrorException,
} from '@nestjs/common'
import { UsersService } from '@services'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt'
import 'dotenv/config'

@Controller('users')
@UseGuards(VerifyTokenGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  @Patch('me')
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request
  ) {
    const token = request.cookies['access_token']

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      })
      return this.usersService.updateMe(+payload.id, updateUserDto)
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Delete('me')
  removeMe(@Req() request: Request) {
    const token = request.cookies['access_token']

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      })
      return this.usersService.removeMe(+payload.id)
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Patch(':id')
  @UseGuards(VerifyRoleGuard)
  @SetMetadata('roles', ['super-admin'])
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto)
  }

  @Delete(':id')
  @UseGuards(VerifyRoleGuard)
  @SetMetadata('roles', ['super-admin'])
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id)
  }

  @Get()
  @UseGuards(VerifyRoleGuard)
  @SetMetadata('roles', ['super-admin'])
  getAll() {
    return this.usersService.getAll()
  }

  @Get(':id')
  @UseGuards(VerifyRoleGuard)
  @SetMetadata('roles', ['super-admin'])
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id)
  }
}
