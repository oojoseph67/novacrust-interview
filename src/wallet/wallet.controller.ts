import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CreateWalletDto, FundWalletDto, TransferWalletDto } from './dto';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'create a new wallet for a user' })
  @ApiBody({ type: CreateWalletDto })
  @ApiResponse({
    status: 201,
    description: 'wallet created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'wallet created successfully' },
        wallet: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            userId: { type: 'string', example: 'uuid' },
            currency: { type: 'string', example: 'USD' },
            balance: { type: 'number', example: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request - user not found or wallet already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async createWallet(@Body() createWalletDto: CreateWalletDto) {
    return await this.walletService.createWallet(createWalletDto);
  }

  @Get(':username')
  @ApiOperation({ summary: 'get wallet information for a user' })
  @ApiParam({
    name: 'username',
    description: 'username of the user',
    example: 'johndoe',
  })
  @ApiResponse({
    status: 200,
    description: 'wallet retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        wallet: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            userId: { type: 'string', example: 'uuid' },
            currency: { type: 'string', example: 'USD' },
            balance: { type: 'number', example: 100.5 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request - user not found or wallet not found',
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async getUserWallet(@Param('username') username: string) {
    return await this.walletService.getUserWallet(username);
  }

  @Post('fund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'fund a user wallet with an amount' })
  @ApiBody({ type: FundWalletDto })
  @ApiResponse({
    status: 200,
    description: 'wallet funded successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'user balance updated successfully',
        },
        wallet: {
          type: 'object',
          description: 'update result object',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'bad request - user not found or wallet not found',
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async fundWallet(@Body() fundWalletDto: FundWalletDto) {
    return await this.walletService.fundWallet(fundWalletDto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'transfer amount between two user wallets' })
  @ApiBody({ type: TransferWalletDto })
  @ApiResponse({
    status: 200,
    description: 'transfer completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '100.50 successfully transferred from johndoe to janedoe',
        },
        senderWallet: {
          type: 'object',
          description: 'update result object',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'bad request - user not found, wallet not found, or insufficient balance',
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async transferBetweenWallet(@Body() transferWalletDto: TransferWalletDto) {
    return await this.walletService.transferBetweenWallet(transferWalletDto);
  }
}
