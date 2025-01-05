import { CreateCourseDto, UpdateCourseDto } from '@dtos'
import { Course, CourseLevel } from '@entities'
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    try {
      const checkCourse = await this.courseRepository.findOneBy({
        name: createCourseDto.name,
      })

      if (checkCourse) {
        throw new ConflictException(
          `Course with name ${createCourseDto.name} already exists`
        )
      }

      const createdCourse = await this.courseRepository.create(createCourseDto)
      await this.courseRepository.save(createdCourse)

      await this.cacheManager.del('courses')

      return {
        success: true,
        message: 'Course created successfully',
        data: createdCourse,
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }

      throw new InternalServerErrorException(error.message)
    }
  }

  async findAll() {
    try {
      const cachedCourses = await this.cacheManager.get('courses')
      if (cachedCourses) {
        return {
          success: true,
          message: 'Courses list retrieved from cache',
          data: JSON.parse(cachedCourses as string),
        }
      }

      const courses = await this.courseRepository.find({
        order: { id: 'ASC' },
      })

      if (!courses) {
        return []
      }

      await this.cacheManager.set('courses', JSON.stringify(courses))

      return {
        success: true,
        message: 'Courses list received successfully',
        data: courses,
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async findOne(id: number) {
    try {
      const course = await this.courseRepository.findOneBy({ id })

      if (!course) {
        throw new NotFoundException(`Couldn't find course with id #${id}`)
      }

      return {
        success: true,
        message: 'Course data received successfully',
        data: course,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }

      throw new InternalServerErrorException(error.message)
    }
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      const course = await this.courseRepository.findOneBy({ id })

      if (!course) {
        throw new NotFoundException(`Couldn't find course with id #${id}`)
      }

      if (updateCourseDto.name) {
        const checkCourseName = await this.courseRepository.findOneBy({
          name: updateCourseDto.name,
        })

        if (checkCourseName) {
          throw new ConflictException(
            `Course with name ${updateCourseDto.name} already exists`
          )
        }
      }

      if (updateCourseDto.level) {
        if (
          updateCourseDto.level !== CourseLevel.EASY &&
          updateCourseDto.level !== CourseLevel.HARD &&
          updateCourseDto.level !== CourseLevel.MEDIUM
        ) {
          throw new BadRequestException(
            `There isn't course-level ${updateCourseDto.level}`
          )
        }
      }

      await this.courseRepository.update(id, updateCourseDto)

      await this.cacheManager.del('courses')

      return {
        success: true,
        message: 'Course updated successfully!',
      }
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException || 
        error instanceof NotFoundException
      ) {
        throw error
      }
      throw new InternalServerErrorException(error.message)
    }
  }

  async remove(id: number) {
    try {
      const course = await this.courseRepository.findOneBy({ id })

      if (!course) {
        throw new NotFoundException(`Couldn't find course with id #${id}`)
      }

      await this.courseRepository.delete(id)

      await this.cacheManager.del('courses')

      return {
        success: true,
        message: 'Course deleted successfully!',
      }
    } catch (error) {
      if(error instanceof NotFoundException) {
        throw error
      }
      
      throw new InternalServerErrorException(error.message)
    }
  }
}
