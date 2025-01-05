import { LoginUserDto, RegisterUserDto } from '@dtos'
import { VerifyTokenGuard } from '@guards'
import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Patch,
  Req,
  InternalServerErrorException,
  Get,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from '@services'
import { Request, Response } from 'express'
import 'dotenv/config'
import { UserRole } from '@entities'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.register(registerUserDto)

    res.cookie('access_token', access_token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    })

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
    })

    return {
      message: 'User registered successfully',
      user,
    }
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.login(loginUserDto)

    res.cookie('access_token', access_token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    })

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
    })

    return {
      message: 'User logged in successfully',
      user,
    }
  }

  @Patch('update-role')
  async update_role(
    @Body() body: { role: UserRole },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const token = request.cookies['access_token']

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      })

      const { access_token, refresh_token, user } =
        await this.authService.update_role(+payload.id, body)

      response.cookie('access_token', access_token, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      })

      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
      })

      return {
        message: 'Role updated successfully!',
        user,
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Post('refresh-token')
  async refreshTokens(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const token = req.cookies['refresh_token']
    const { access_token, refresh_token } =
      await this.authService.refreshTokens(token)

    res.cookie('access_token', access_token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    })

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
    })
  }

  @UseGuards(VerifyTokenGuard)
  @Post('logout')
  async logout(@Res() res: Response, @Req() request: Request) {
    const token = request.cookies['access_token']

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      })

      res.clearCookie('access_token')
      res.clearCookie('refresh_token')

      res.cookie('access_token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
      })

      res.cookie('refresh_token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
      })

      const result = await this.authService.logout(+payload.id)
      return res.status(200).send(result)
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @UseGuards(VerifyTokenGuard)
  @Get('me')
  getMe(@Req() request: Request) {
    const token = request.cookies['access_token']

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      })

      return this.authService.getMe(+payload?.id)
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }
}