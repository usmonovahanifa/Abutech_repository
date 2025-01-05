import { UsersController } from '@controllers'
import { Course, User } from '@entities'
import { VerifyRoleGuard, VerifyTokenGuard } from '@guards'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import 'dotenv/config'
import { UsersService } from '@services'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Course]),
    JwtModule.register({ secret: process.env.SECRET_KEY }),
  ],
  controllers: [UsersController],
  providers: [UsersService, VerifyTokenGuard, VerifyRoleGuard],
  exports: [UsersService],
})
export class UsersModule {}
