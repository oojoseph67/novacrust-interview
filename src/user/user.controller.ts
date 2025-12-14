import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto';
import { User } from './entities';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'user created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'user@example.com' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'bad request - email/username already exists or invalid email address',
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'get all users' })
  @ApiResponse({
    status: 200,
    description: 'list of all users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid' },
          username: { type: 'string', example: 'johndoe' },
          email: { type: 'string', example: 'user@example.com' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async findAllUsers(): Promise<User[]> {
    return await this.userService.findAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'get user by id' })
  @ApiParam({
    name: 'id',
    description: 'user id (uuid)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'user retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'user@example.com' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'user not found',
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async findUserById(@Param('id') id: string): Promise<User> {
    return await this.userService.findUserById(id);
  }

  @Get('by-email')
  @ApiOperation({ summary: 'get user by email address' })
  @ApiQuery({
    name: 'email',
    description: 'email address of the user',
    example: 'user@example.com',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'user retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'user@example.com' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'user not found (returns null)',
    schema: {
      type: 'null',
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async findUserByEmail(@Query('email') email: string): Promise<User | null> {
    return await this.userService.findUserByEmail(email);
  }

  @Get('by-username/:username')
  @ApiOperation({ summary: 'get user by username' })
  @ApiParam({
    name: 'username',
    description: 'username of the user',
    example: 'johndoe',
  })
  @ApiResponse({
    status: 200,
    description: 'user retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'user@example.com' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'user not found (returns null)',
    schema: {
      type: 'null',
    },
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async findUserByUsername(
    @Param('username') username: string,
  ): Promise<User | null> {
    return await this.userService.findUserByUsername(username);
  }
}
