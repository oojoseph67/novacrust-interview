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
    try {
      const { email, username } = createData;

      if (!email) {
        throw new HttpException(
          'Please provide just an email or phone number',
          HttpStatus.BAD_REQUEST,
        );
      }

      // check for spam email before proceeding
      if (email) {
        if (SpamDetectionUtil.isSpamEmail(email)) {
          this.logger.warn('spam email detected in user creation', { email });
          throw new HttpException(
            'invalid email address. please use a valid email address',
            HttpStatus.BAD_REQUEST,
          );
        }
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
      console.log({ error });
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Error creating user: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
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
      throw new HttpException(
        `Error finding user using email: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async findUserByUsername(username: string): Promise<User> {
    try {
      // return null if email is null, undefined, or empty
      if (!username) {
        return null;
      }

      const user = await this.userRepository.findOne({ where: { username } });

      return user;
    } catch (error) {
      throw new HttpException(
        `Error finding user using email: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
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
      throw new HttpException(
        `Error finding user(raw) with id ${id}... : ${error.message}`,
        HttpStatus.BAD_GATEWAY,
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
          `User with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error finding user with id ${id}... : ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['role'],
      });

      return users;
    } catch (error) {
      throw new HttpException(
        `Error fetching all users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
