import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule, CoursesModule, UsersModule } from '@modules'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager'
import { APP_INTERCEPTOR } from '@nestjs/core'

@Module({
  imports: [
    CacheModule.register({
      store: 'redis',
      host: 'localhost',
      port: 6379,
      ttl: 5,
      max: 10,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: (process.env.DB_PORT as unknown as number) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '20091206',
      database: process.env.DB_NAME || 'repository',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [AppService],
})
export class AppModule {}
