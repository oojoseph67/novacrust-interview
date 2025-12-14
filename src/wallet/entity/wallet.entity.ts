import { Exclude } from 'class-transformer';
import { User } from 'src/user/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type Currency = 'USDT' | 'USDC' | 'NGN' | 'USD';

@Entity({ name: 'wallet' })
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    type: 'uuid',
    nullable: false,
  })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
  })
  user: User;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  currency: Currency;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
  })
  balance: number;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;
}
