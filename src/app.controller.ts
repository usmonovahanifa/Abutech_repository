import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller()
@CacheTTL(50)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @CacheKey('custom_key')
  @CacheTTL(20)
  findAll(): string[] {
    return [];
  }
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
