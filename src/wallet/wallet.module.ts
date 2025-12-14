import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entity';
import { UserModule } from 'src/user/user.module';
import { WalletMutationProvider } from './providers';

@Module({
  controllers: [WalletController],
  providers: [WalletService, WalletMutationProvider],
  imports: [TypeOrmModule.forFeature([Wallet]), UserModule],
})
export class WalletModule {}
