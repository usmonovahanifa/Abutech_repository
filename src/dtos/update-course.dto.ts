import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from '@dtos';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
