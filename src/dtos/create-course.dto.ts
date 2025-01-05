import { Course, CourseLevel } from '@entities'
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  description: string

  @IsString()
  @IsNotEmpty()
  category: string

  @IsNumber()
  @IsNotEmpty()
  price: number

  @IsEnum(Course)
  @IsNotEmpty()
  level: CourseLevel
}
