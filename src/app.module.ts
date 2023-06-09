import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { Dialect } from 'sequelize';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AllExceptionsFilter } from './exception-filters/all-exceptions.filter';
import { TextBlockModule } from './text-block/text-block.module';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { User } from './auth/entities/user.entity';
import { Profile } from './profile/entities/profile.entity';
import { Role } from './roles/entities/role.entity';
import { TextBlock } from './text-block/entities/text-block.entity';
import { UserRole } from './roles/entities/user-role.entity';
import { File } from './file/entities/file.entity';
import configurations from './configurations';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurations],
      envFilePath: ['.env'],
    }),
    SequelizeModule.forRoot({
      dialect: (process.env.DB_DIALECT as Dialect) || 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'root',
      database: process.env.POSTGRES_DB || 'postgres',
      models: [User, Profile, Role, UserRole, File, TextBlock],
      autoLoadModels: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'static'),
    }),
    AuthModule,
    ProfileModule,
    RolesModule,
    TextBlockModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
