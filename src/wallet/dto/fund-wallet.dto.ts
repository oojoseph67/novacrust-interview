import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString, IsString, Matches } from 'class-validator';

export class FundWalletDto {
  @ApiProperty({
    description: 'transfer amount (non-negative number)',
    example: '100.50',
  })
  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^(0|[1-9]\d*)(\.\d+)?$/, {
    message: 'amount must be a non-negative number',
  })
  amount: string;

  @ApiProperty({
    description: 'username of the user to fund wallet for',
    example: 'johndoe',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (value ? String(value).toLowerCase() : value))
  username: string;
}
