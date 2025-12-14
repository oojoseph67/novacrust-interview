import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities';
import { SpamDetectionUtil } from 'src/global/utils/spam-detection.util';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly ADMIN_CODE: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createData: { email: string; username: string }): Promise<User> {
    const { email, username } = createData;
    try {
      if (!email) {
        throw new HttpException('email is required', HttpStatus.BAD_REQUEST);
      }

      if (!username) {
        throw new HttpException('username is required', HttpStatus.BAD_REQUEST);
      }

      // check for spam email before proceeding
      if (SpamDetectionUtil.isSpamEmail(email)) {
        this.logger.warn('spam email detected in user creation', { email });
        throw new HttpException(
          'invalid email address. please use a valid email address',
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingUsername = await this.findUserByUsername(username);
      if (existingUsername) {
        throw new HttpException(
          `username already exists`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        throw new HttpException(
          `email exists... provide another email`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userRepository.create({
        email,
        username,
      });
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      this.logger.error('error creating user', {
        error: error.message,
        stack: error.stack,
        email,
        username,
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'failed to create user. please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      // return null if email is null, undefined, or empty
      if (!email) {
        return null;
      }

      const user = await this.userRepository.findOne({ where: { email } });

      return user;
    } catch (error) {
      this.logger.error('error finding user by email', {
        error: error.message,
        stack: error.stack,
        email,
      });

      throw new HttpException(
        'failed to find user by email. please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUserByUsername(username: string): Promise<User> {
    try {
      // return null if username is null, undefined, or empty
      if (!username) {
        return null;
      }

      const user = await this.userRepository.findOne({ where: { username } });

      return user;
    } catch (error) {
      this.logger.error('error finding user by username', {
        error: error.message,
        stack: error.stack,
        username,
      });

      throw new HttpException(
        'failed to find user by username. please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUserByIdRaw(id: string | number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: String(id) },
        relations: ['role'],
      });

      return user;
    } catch (error) {
      this.logger.error('error finding user by id (raw)', {
        error: error.message,
        stack: error.stack,
        id,
      });

      throw new HttpException(
        'failed to find user. please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUserById(id: string | number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: String(id) },
      });

      if (!user) {
        throw new HttpException(
          `user with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('error finding user by id', {
        error: error.message,
        stack: error.stack,
        id,
      });

      throw new HttpException(
        'failed to find user. please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        order: { createdAt: 'DESC' },
      });

      return users;
    } catch (error) {
      this.logger.error('error fetching all users', {
        error: error.message,
        stack: error.stack,
      });

      throw new HttpException(
        'failed to fetch users. please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
