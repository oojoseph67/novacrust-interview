import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Wallet } from './entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWalletDto, FundWalletDto, TransferWalletDto } from './dto';
import { UserService } from 'src/user/user.service';
import { WalletMutationProvider } from './providers';

@Injectable()
export class WalletService {
  private logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,

    private userService: UserService,
    private walletMutationProvider: WalletMutationProvider,
  ) {}

  async createWallet(createWalletDto: CreateWalletDto) {
    try {
      const { username } = createWalletDto;

      const user = await this.userService.findUserByUsername(username);
      if (!user) {
        throw new HttpException(
          `user not found... please create an account`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingWallet = await this.walletRepository.findOne({
        where: {
          userId: user.id,
        },
      });
      if (existingWallet) {
        throw new HttpException(
          `user already has a wallet`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const userWallet = await this.walletRepository.create({
        currency: 'USD',
        userId: user.id,
      });
      await this.walletRepository.save(userWallet);

      return {
        message: `wallet created successfully`,
        wallet: userWallet,
      };
    } catch (error) {
      this.logger.error({ error });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `error creating wallet`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserWallet(username: string) {
    try {
      const user = await this.userService.findUserByUsername(username);
      if (!user) {
        throw new HttpException(
          `user not found... please create an account`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const userWallet = await this.walletRepository.findOne({
        where: {
          userId: user.id,
        },
      });

      if (!userWallet) {
        throw new HttpException(
          `user wallet not found... please create a wallet`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return { wallet: userWallet };
    } catch (error) {
      this.logger.error({ error });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `error getting user wallet`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fundWallet(fundWalletDto: FundWalletDto) {
    return await this.walletMutationProvider.fundWallet(fundWalletDto);
  }

  async transferBetweenWallet(transferWalletDto: TransferWalletDto) {
    return await this.walletMutationProvider.transferBetweenWallet(
      transferWalletDto,
    );
  }
}
