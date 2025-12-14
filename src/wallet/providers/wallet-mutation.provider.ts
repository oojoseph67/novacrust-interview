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

      // validate amount
      const fundAmount = parseFloat(amount);
      if (isNaN(fundAmount) || fundAmount <= 0) {
        throw new HttpException(
          'amount must be a positive number',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userService.findUserByUsername(username);
      if (!user) {
        throw new HttpException(
          'user not found. please create an account first',
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
          'user wallet not found. please create a wallet first',
          HttpStatus.BAD_REQUEST,
        );
      }

      // convert to numbers and ensure proper decimal precision
      const currentBalance = parseFloat(String(userWallet.balance || 0));
      const newBalance = parseFloat((currentBalance + fundAmount).toFixed(8));

      await this.walletRepository.update(userWallet.id, {
        balance: newBalance,
      });

      const updatedUserWallet = await this.walletRepository.findOne({
        where: { userId: userWallet.userId },
      });

      this.logger.log('wallet funded successfully', {
        username,
        amount: fundAmount,
        previousBalance: currentBalance,
        newBalance,
      });

      return {
        message: 'wallet funded successfully',
        wallet: updatedUserWallet,
      };
    } catch (error) {
      this.logger.error('error funding wallet', {
        error: error.message,
        stack: error.stack,
        username: fundWalletDto.username,
        amount: fundWalletDto.amount,
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'failed to fund wallet. please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async transferBetweenWallet(transferWalletDto: TransferWalletDto) {
    try {
      const { amount, receiverUsername, senderUsername } = transferWalletDto;

      // validate amount
      const transferAmount = parseFloat(amount);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        throw new HttpException(
          'amount must be a positive number',
          HttpStatus.BAD_REQUEST,
        );
      }

      // prevent self-transfer
      if (senderUsername.toLowerCase() === receiverUsername.toLowerCase()) {
        throw new HttpException(
          'cannot transfer funds to yourself',
          HttpStatus.BAD_REQUEST,
        );
      }

      const senderUser =
        await this.userService.findUserByUsername(senderUsername);
      if (!senderUser) {
        throw new HttpException(
          `sender '${senderUsername}' not found. please create an account first`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const receiverUser =
        await this.userService.findUserByUsername(receiverUsername);
      if (!receiverUser) {
        throw new HttpException(
          `receiver '${receiverUsername}' not found. please create an account first`,
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
          `sender '${senderUsername}' wallet not found. please create a wallet first`,
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
          `receiver '${receiverUsername}' wallet not found. please create a wallet first`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // convert to numbers and ensure proper decimal precision
      const senderBalance = parseFloat(String(senderWallet.balance || 0));
      const receiverBalance = parseFloat(String(receiverWallet.balance || 0));

      if (senderBalance < transferAmount) {
        throw new HttpException(
          `insufficient balance. current balance: ${senderBalance}, required: ${transferAmount}`,
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

        this.logger.log('wallet transfer completed successfully', {
          senderUsername,
          receiverUsername,
          amount: transferAmount,
          senderPreviousBalance: senderBalance,
          senderNewBalance: senderNewBalance,
        });

        return {
          message: `${transferAmount} successfully transferred from ${senderUsername} to ${receiverUsername}`,
          senderWallet: updatedSenderWallet,
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error('transaction rollback - wallet transfer failed', {
          error: error.message,
          stack: error.stack,
          senderUsername,
          receiverUsername,
          amount: transferAmount,
        });
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('error transferring funds between wallets', {
        error: error.message,
        stack: error.stack,
        senderUsername: transferWalletDto.senderUsername,
        receiverUsername: transferWalletDto.receiverUsername,
        amount: transferWalletDto.amount,
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'failed to transfer funds. please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
