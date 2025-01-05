import { UpdateUserDto } from '@dtos'
import { User } from '@entities'
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getAll() {
    const cacheKey = 'users-list'

    try {
      const cachedUsers = await this.cacheManager.get(cacheKey)
      if (cachedUsers) {
        return {
          success: true,
          message: 'User list retrieved from cache',
          data: cachedUsers,
        }
      }

      const users = await this.userRepository.find({
        select: { id: true, full_name: true, username: true, email: true },
        order: { id: 'ASC' },
      })

      if (!users) {
        throw new NotFoundException('There are no users in the database')
      }

      await this.cacheManager.set(cacheKey, users)

      return {
        success: true,
        message: 'User list retrieved from database',
        data: users,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      
      throw new InternalServerErrorException(
        'Something went wrong while getting users from database'
      )
    }
  }

  async findOne(id: number) {
    const cacheKey = `user-${id}`

    try {
      const cachedUser = await this.cacheManager.get(cacheKey)
      if (cachedUser) {
        return {
          success: true,
          message: 'User data retrieved from cache',
          data: cachedUser,
        }
      }

      const user = await this.userRepository.findOneBy({ id })

      if (!user) {
        throw new NotFoundException(`Cannot find user with id #${id}`)
      }

      await this.cacheManager.set(cacheKey, user)

      return {
        success: true,
        message: 'User data retrieved from database',
        data: user,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      []
      throw new InternalServerErrorException(
        'Something went wrong while getting user data'
      )
    }
  }

  async updateMe(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id })

      if (!user) {
        throw new NotFoundException(`There is no user with id #${id}`)
      }

      if (updateUserDto.email) {
        const checkUser = await this.userRepository.findOneBy({
          email: updateUserDto.email,
        })

        if (checkUser) {
          throw new ConflictException(
            `User with email ${updateUserDto.email} already exists`
          )
        }
      }

      if (updateUserDto.username) {
        const checkUser = await this.userRepository.findOneBy({
          username: updateUserDto.username,
        })

        if (checkUser) {
          throw new ConflictException(
            `User with username ${updateUserDto.username} already exists`
          )
        }
      }

      if (updateUserDto.password) {
        const hashedPassword = await bcrypt.hash(updateUserDto.password, 10)

        await this.userRepository.update(id, { password: hashedPassword })
      }

      await this.userRepository.update(id, {
        email: updateUserDto.email || user.email,
        full_name: updateUserDto.full_name || user.full_name,
        username: updateUserDto.username || user.username,
      })
      await this.cacheManager.del(`user-${id}`)

      return {
        success: true,
        message: 'Your data updated successfully!',
      }
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error
      }
      
      throw new InternalServerErrorException(
        'Something went wrong while updating personal data'
      )
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id })

      if (!user) {
        throw new NotFoundException(`There is no user with id #${id}`)
      }

      if (updateUserDto.email) {
        const checkUser = await this.userRepository.findOneBy({
          email: updateUserDto.email,
        })

        if (checkUser) {
          throw new ConflictException(
            `User with email ${updateUserDto.email} already exists`
          )
        }
      }

      if (updateUserDto.username) {
        const checkUser = await this.userRepository.findOneBy({
          username: updateUserDto.username,
        })

        if (checkUser) {
          throw new ConflictException(
            `User with username ${updateUserDto.username} already exists`
          )
        }
      }

      if (updateUserDto.password) {
        const hashedPassword = await bcrypt.hash(updateUserDto.password, 10)

        await this.userRepository.update(id, { password: hashedPassword })
      }

      await this.userRepository.update(id, {
        email: updateUserDto.email || user.email,
        full_name: updateUserDto.full_name || user.full_name,
        username: updateUserDto.username || user.username,
      })
      await this.cacheManager.del(`user-${id}`)

      return {
        success: true,
        message: 'Data updated successfully!',
      }
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error
      }
      
      throw new InternalServerErrorException(
        'Something went wrong while updating user'
      )
    }
  }

  async remove(id: number) {
    const cacheKey = `user-${id}`

    try {
      const user = await this.userRepository.findOneBy({ id })

      if (!user) {
        throw new NotFoundException(`Cannot find user with id #${id}`)
      }

      await this.userRepository.delete(id)
      await this.cacheManager.del(cacheKey)

      return {
        success: true,
        message: 'User deleted successfully!',
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      
      throw new InternalServerErrorException(
        'Something went wrong while removing user'
      )
    }
  }

  async removeMe(id: number) {
    const cacheKey = `user-${id}`

    try {
      const user = await this.userRepository.findOneBy({ id })

      if (!user) {
        throw new NotFoundException(`There is no user with id #${id}`)
      }

      await this.userRepository.delete(id)
      await this.cacheManager.del(cacheKey)

      return {
        success: true,
        message: 'You are deleted from the database',
      }
    } catch (error) {
      if(error instanceof NotFoundException) {
        throw error
      }
      
      throw new InternalServerErrorException(error.message)
    }
  }
}
