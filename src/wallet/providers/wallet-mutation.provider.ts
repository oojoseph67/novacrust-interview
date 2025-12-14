import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Wallet } from '../entity';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FundWalletDto, TransferWalletDto } from '../dto';

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

  async transferBetweenWallet(transferWalletDto: TransferWalletDto) {
    try {
      const { amount, receiverUsername, senderUsername } = transferWalletDto;

      const senderUser =
        await this.userService.findUserByUsername(senderUsername);
      if (!senderUser) {
        throw new HttpException(
          `sender ${senderUsername} not found... please create an account`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const receiverUser =
        await this.userService.findUserByUsername(receiverUsername);
      if (!receiverUser) {
        throw new HttpException(
          `receiver ${receiverUsername} not found... please create an account`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const senderWallet = await this.walletRepository.findOne({
        where: {
          userId: senderUser.id,
        },
      });
      if (!senderWallet) {
        throw new HttpException(
          `sender ${senderUsername} wallet not found... please create a wallet`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const receiverWallet = await this.walletRepository.findOne({
        where: {
          userId: receiverUser.id,
        },
      });
      if (!receiverWallet) {
        throw new HttpException(
          `receiver ${receiverUsername} wallet not found... please create a wallet`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (senderWallet.balance < Number(amount)) {
        throw new HttpException(
          `insufficient amount... current balance is ${senderWallet.balance}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const receiverNewBalance = receiverWallet.balance + Number(amount);
      const senderNewBalance = senderWallet.balance - Number(amount);

      const updatedSenderWallet = await this.walletRepository.update(
        senderWallet.id,
        {
          balance: senderNewBalance,
        },
      );

      await this.walletRepository.update(receiverWallet.id, {
        balance: receiverNewBalance,
      });

      return {
        message: `${amount} successfully transferred from ${senderUsername} to ${receiverUsername}`,
        senderWallet: updatedSenderWallet,
      };
    } catch (error) {
      this.logger.error({ error });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `error transfer amount between wallet`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
