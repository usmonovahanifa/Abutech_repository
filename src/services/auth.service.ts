import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import 'dotenv/config'
import { LoginUserDto, RegisterUserDto } from '@dtos'
import { User, UserRole } from '@entities'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly JwtService: JwtService
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: registerUserDto.email },
          { username: registerUserDto.username },
        ],
      })

      if (existingUser) {
        if (existingUser.email === registerUserDto.email) {
          throw new BadRequestException('User with this email already exists')
        }

        if (existingUser.username === registerUserDto.username) {
          throw new BadRequestException(
            'User with this username already exists'
          )
        }
      }

      const hashedPassword = await bcrypt.hash(registerUserDto.password, 10)
      const newUser = this.userRepository.create({
        full_name: registerUserDto.full_name,
        username: registerUserDto.username,
        email: registerUserDto.email,
        password: hashedPassword,
      })

      await this.userRepository.save(newUser)

      const access_token = this.JwtService.sign(
        {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
        { secret: process.env.SECRET_KEY }
      )

      const refresh_token = this.JwtService.sign(
        {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
        { secret: process.env.SECRET_KEY }
      )

      await this.userRepository.update(newUser.id, { refresh_token })

      return {
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
        access_token,
        refresh_token,
      }
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error
      }

      throw new InternalServerErrorException(
        'Something went wrong during user registration'
      )
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const checkUser = await this.userRepository.findOne({
        where: [
          { username: loginUserDto.username },
          { email: loginUserDto.email },
        ],
      })

      if (!checkUser) {
        throw new NotFoundException('There is not any user with these data')
      }

      const access_token = this.JwtService.sign(
        {
          id: checkUser.id,
          email: checkUser.email,
          role: checkUser.role,
        },
        { secret: process.env.SECRET_KEY }
      )

      const refresh_token = this.JwtService.sign(
        {
          id: checkUser.id,
          username: checkUser.username,
          role: checkUser.role,
        },
        { secret: process.env.SECRET_KEY }
      )

      await this.userRepository.update(checkUser.id, { refresh_token })

      return {
        success: true,
        message: 'User logged in successfully',
        user: {
          id: checkUser.id,
          username: checkUser.username,
          email: checkUser.email,
        },
        access_token,
        refresh_token,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }

      throw new InternalServerErrorException(
        'Something went wrong during user logging in'
      )
    }
  }

  async update_role(id: number, body: { role: UserRole }) {
    try {
      const user = await this.userRepository.findOneBy({ id })

      if (!user) {
        throw new NotFoundException(`Cannot find user with id #${id}`)
      }

      if (
        body.role !== UserRole.EMPLOYEE &&
        body.role !== UserRole.SUPER_ADMIN
      ) {
        throw new BadRequestException(`There is not user role '${body.role}'`)
      }

      await this.userRepository.update(id, { role: body.role })

      const access_token = this.JwtService.sign(
        {
          id: user.id,
          email: user.email,
          role: body.role,
        },
        { secret: process.env.SECRET_KEY }
      )

      const refresh_token = this.JwtService.sign(
        {
          id: user.id,
          username: user.username,
          role: body.role,
        },
        { secret: process.env.SECRET_KEY }
      )

      await this.userRepository.update(id, { refresh_token })

      return {
        success: true,
        message: 'Role updated successfully!',
        user: {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          role: body.role,
        },
        access_token,
        refresh_token,
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error
      }
      throw new InternalServerErrorException(
        'Something went wrong while updating user role'
      )
    }
  }

  async getMe(id: number) {
    try {
      const user = await this.userRepository.findOneBy({ id })

      if (!user) {
        throw new NotFoundException(`Cannot found user with id #${id}`)
      }

      return {
        success: true,
        message: 'Your information received successfully!',
        data: {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException(
        'Something went wrong while getting own data'
      )
    }
  }

  async logout(id: number) {
    try {
      const user = await this.userRepository.findOneBy({ id })

      if (!user) {
        throw new NotFoundException(`Couldn't find use with id #${id}`)
      }

      await this.userRepository.update(id, { refresh_token: null })

      return {
        success: true,
        message: 'You logged out successfully!',
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }

      throw new InternalServerErrorException(error.message)
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const user = await this.userRepository.findOneBy({
        refresh_token: refreshToken,
      })

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      const access_token = this.JwtService.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        { secret: process.env.SECRET_KEY }
      )

      const refresh_token = this.JwtService.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        { secret: process.env.SECRET_KEY }
      )

      await this.userRepository.update({ id: user.id }, { refresh_token })

      return {
        success: true,
        message: 'Tokens updated successfully!',
        access_token,
        refresh_token,
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }

      throw new InternalServerErrorException(error.message)
    }
  }
}