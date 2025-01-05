import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '@entities'
import 'dotenv/config'
import { UsersService } from '@services'

@Injectable()
export class VerifyTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = request.cookies['access_token']

    if (!token) {
      return false
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      })

      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      })

      return !!user
    } catch (error) {
      if (error) {
        return false
      }
    }
  }
}
