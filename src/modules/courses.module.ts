import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { CoursesController } from '@controllers'
import { CoursesService, UsersService } from '@services'
import { Course, User } from '@entities'
import { VerifyTokenGuard } from '@guards'
import 'dotenv/config'

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, User]),
    JwtModule.register({ secret: process.env.SECRET_KEY }),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, VerifyTokenGuard, UsersService],
})
export class CoursesModule {}
