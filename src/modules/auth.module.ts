import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from '@controllers'
import { AuthService, UsersService } from '@services'
import { User } from '@entities'
import { VerifyTokenGuard } from '@guards'
import 'dotenv/config'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({ secret: process.env.SECRET_KEY }),
  ],
  controllers: [AuthController],
  providers: [AuthService, VerifyTokenGuard, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
