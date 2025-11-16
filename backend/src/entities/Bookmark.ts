import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Profile } from './Profile';

@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.id)
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Profile, profile => profile.id)
  profile!: Profile;

  @Column()
  profileId!: string;

  @CreateDateColumn()
  createdAt!: Date;
} 