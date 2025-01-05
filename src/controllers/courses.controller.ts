import { CreateCourseDto, UpdateCourseDto } from '@dtos'
import { VerifyRoleGuard, VerifyTokenGuard } from '@guards'
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
} from '@nestjs/common'
import { CoursesService } from '@services'

@UseGuards(VerifyTokenGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id)
  }

  @Post()
  @UseGuards(VerifyRoleGuard)
  @SetMetadata('roles', ['super-admin'])
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto)
  }

  @Patch(':id')
  @UseGuards(VerifyRoleGuard)
  @SetMetadata('roles', ['super-admin'])
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(+id, updateCourseDto)
  }

  @Delete(':id')
  @UseGuards(VerifyRoleGuard)
  @SetMetadata('roles', ['super-admin'])
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id)
  }
}
