import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Wallet } from '../entity';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FundWalletDto } from '../dto';

@Injectable()
export class WalletMutationProvider {
  private readonly logger = new Logger(WalletMutationProvider.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,

    private userService: UserService,
  ) {}

  async fundWallet(fundWalletDto: FundWalletDto) {
    try {
      const { amount, username } = fundWalletDto;

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

      const newBalance = userWallet.balance + Number(amount);

      const updatedUserWallet = await this.walletRepository.update(
        userWallet.id,
        {
          balance: newBalance,
        },
      );

      return {
        message: `user balance updated successfully`,
        wallet: updatedUserWallet,
      };
    } catch (error) {
      this.logger.error({ error });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `error funding user wallet`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
