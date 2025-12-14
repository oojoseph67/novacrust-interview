import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
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
    private dataSource: DataSource,
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

      // convert to numbers and ensure proper decimal precision
      const currentBalance = parseFloat(String(userWallet.balance || 0));
      const fundAmount = parseFloat(amount);
      const newBalance = parseFloat((currentBalance + fundAmount).toFixed(8));

      await this.walletRepository.update(userWallet.id, {
        balance: newBalance,
      });

      const updatedUserWallet = await this.walletRepository.findOne({
        where: { userId: userWallet.userId },
      });

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

      // convert to numbers and ensure proper decimal precision
      const senderBalance = parseFloat(String(senderWallet.balance || 0));
      const receiverBalance = parseFloat(String(receiverWallet.balance || 0));
      const transferAmount = parseFloat(amount);

      if (senderBalance < transferAmount) {
        throw new HttpException(
          `insufficient amount... current balance is ${senderBalance}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const receiverNewBalance = parseFloat(
        (receiverBalance + transferAmount).toFixed(8),
      );
      const senderNewBalance = parseFloat(
        (senderBalance - transferAmount).toFixed(8),
      );

      // use transaction to ensure atomicity of both wallet updates
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.update(
          Wallet,
          { id: senderWallet.id },
          { balance: senderNewBalance },
        );

        await queryRunner.manager.update(
          Wallet,
          { id: receiverWallet.id },
          { balance: receiverNewBalance },
        );

        await queryRunner.commitTransaction();

        // fetch updated sender wallet for response
        const updatedSenderWallet = await this.walletRepository.findOne({
          where: { id: senderWallet.id },
        });

        return {
          message: `${amount} successfully transferred from ${senderUsername} to ${receiverUsername}`,
          senderWallet: updatedSenderWallet,
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
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
