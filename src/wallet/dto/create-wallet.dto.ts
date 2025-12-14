import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    description: 'username of the user to create wallet for',
    example: 'johndoe',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ obj }: { obj: { username: string } }) =>
    obj.username.toLowerCase(),
  )
  username: string;
}
