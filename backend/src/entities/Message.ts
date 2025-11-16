import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Profile } from './Profile';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  content!: string;

  @ManyToOne(() => User, user => user.id)
  sender!: User;

  @Column()
  senderId!: string;

  @ManyToOne(() => Profile, profile => profile.id)
  recipientProfile!: Profile;

  @Column()
  recipientProfileId!: string;

  @CreateDateColumn()
  createdAt!: Date;
} 