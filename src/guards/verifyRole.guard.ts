import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import 'dotenv/config';

@Injectable()
export class VerifyRoleGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.access_token;

    if (!token) {
      throw new ForbiddenException('Access token not found');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      });
      const userRole = decoded.role;

      if (!roles.includes(userRole)) {
        throw new ForbiddenException('Access denied: insufficient permissions');
      }

      return true;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
}
