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

  @IsNotEmpty()
  @IsString()
  @Transform(({ obj }: { obj: { username: string } }) =>
    obj.username.toLowerCase(),
  )
  username: string;
}
