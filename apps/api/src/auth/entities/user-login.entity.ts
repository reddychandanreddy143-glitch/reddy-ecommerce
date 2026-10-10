import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_logins')
export class UserLogin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 100, default: 'Email/Password' })
  loginMethod: string;

  @Column({ type: 'varchar', length: 50, default: 'Success' })
  status: string;

  @CreateDateColumn()
  loginTime: Date;
}