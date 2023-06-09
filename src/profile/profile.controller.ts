import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/guards/role-auth.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { BanUserDto } from './dto/ban-user.dto';
import { DeBanUserDto } from './dto/de-ban-user.dto';
import { RoleOrSelfUserGuard } from '../guards/role-or-self-user.guard';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'Создать пользователя' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Post('registration')
  createProfile(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.createProfile(createProfileDto);
  }

  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseGuards(AuthGuard)
  @Get('profile')
  getAll() {
    return this.profileService.getAll();
  }

  @ApiOperation({ summary: 'Получить пользователя' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseGuards(AuthGuard)
  @Get('profile/:id')
  getOne(@Param('id') id: string) {
    return this.profileService.getOne(+id);
  }

  @ApiOperation({ summary: 'Обновить профиль' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Roles('ADMIN')
  @UseGuards(RoleOrSelfUserGuard)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Put('profile/:id')
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(+id, updateProfileDto);
  }

  @ApiOperation({ summary: 'Удалить профиль' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Roles('ADMIN')
  @UseGuards(RoleOrSelfUserGuard)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('profile/:id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }

  @ApiOperation({ summary: 'Забанить пользователя' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Roles('ADMIN')
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post('profile/add-ban')
  ban(@Body() banUser: BanUserDto) {
    return this.profileService.banToUser(banUser);
  }

  @ApiOperation({ summary: 'Разбанить пользователя' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Roles('ADMIN')
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post('profile/remove-ban')
  deBan(@Body() deBanUser: DeBanUserDto) {
    return this.profileService.deBanToUser(deBanUser);
  }
}
