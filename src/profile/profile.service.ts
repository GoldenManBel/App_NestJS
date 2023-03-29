import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/sequelize';
import { Repository } from 'sequelize-typescript';
import { AuthService } from 'src/auth/auth.service';
import { BanUserDto } from './dto/ban-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { DeBanUserDto } from './dto/de-ban-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile) private profileRepository: Repository<Profile>,
    private authService: AuthService,
  ) {}

  async createProfile(createProfileDto: CreateProfileDto) {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      city,
    } = createProfileDto;

    const isConfirmPassword = this.checkConfirmPassword(
      password,
      confirmPassword,
    );

    if (!isConfirmPassword) {
      throw new HttpException(
        'Confirm password is not correct!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPhone = await this.checkPhone(phone);

    if (isPhone) {
      throw new HttpException('Phone already exists!', HttpStatus.BAD_REQUEST);
    }

    const isEmail = await this.authService.checkUserEmail(email);

    if (isEmail) {
      throw new HttpException('Email already exists!', HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.authService.createUser(email, password);

    const newProfile = await this.profileRepository.create({
      firstName,
      lastName,
      phone,
      city,
      user_id: newUser.user_id,
    });

    const profile = await this.authService.getOneUser(newProfile.user_id);

    return profile;
  }

  async getAll() {
    const profiles = await this.authService.getAllUsers();

    return profiles;
  }

  async getOne(id: number) {
    const profile = await this.authService.getOneUser(id);

    if (!profile) {
      throw new HttpException('Profile is not find!', HttpStatus.NOT_FOUND);
    }

    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    const { email, password, firstName, lastName, phone, city } =
      updateProfileDto;

    const profile = await this.profileRepository.findOne({
      where: { user_id: id },
    });

    if (!profile) {
      throw new HttpException('Profile is not find!', HttpStatus.NOT_FOUND);
    }

    const isPhone = await this.checkPhone(phone);

    if (isPhone) {
      throw new HttpException('Phone already exists!', HttpStatus.BAD_REQUEST);
    }

    const isEmail = await this.authService.checkUserEmail(email);

    if (isEmail) {
      throw new HttpException('Email already exists!', HttpStatus.BAD_REQUEST);
    }

    await this.authService.updateUser(email, password, id);

    await this.profileRepository.update(
      { firstName, lastName, phone, city },
      { where: { user_id: id } },
    );

    const updateProfile = await this.authService.getOneUser(id);

    return updateProfile;
  }

  async remove(id: number) {
    const profile = await this.profileRepository.findOne({
      where: { user_id: id },
    });

    if (!profile) {
      throw new HttpException('Profile is not find!', HttpStatus.NOT_FOUND);
    }

    const removeUser = await this.authService.removeUser(id);

    if (removeUser) {
      return;
    }
  }

  async banToUser(banUser: BanUserDto) {
    const profile = await this.profileRepository.findOne({
      where: { user_id: banUser.user_id },
    });

    if (!profile) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    profile.banned = true;
    profile.banReason = banUser.banReason;

    await profile.save();

    const user = await this.authService.getOneUser(banUser.user_id);

    return user;
  }

  async deBanToUser(deBanUser: DeBanUserDto) {
    const profile = await this.profileRepository.findOne({
      where: { user_id: deBanUser.user_id },
    });

    if (!profile) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    profile.banned = false;
    profile.banReason = null;

    await profile.save();

    const user = await this.authService.getOneUser(deBanUser.user_id);

    return user;
  }

  private checkConfirmPassword(password: string, confirmPassword: string) {
    return password === confirmPassword;
  }

  private async checkPhone(phone: number) {
    const isPhone = await this.profileRepository.findOne({
      where: { phone },
    });

    return isPhone;
  }
}