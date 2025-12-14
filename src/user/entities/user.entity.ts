import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({
    unique: true,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  username: string;

  @Index({
    unique: true,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  lowercaseUsername() {
    // convert username to lowercase for consistent storage
    if (this.username) {
      this.username = this.username.toLowerCase();
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  lowercaseEmail() {
    // convert email to lowercase for consistent storage
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }
}
