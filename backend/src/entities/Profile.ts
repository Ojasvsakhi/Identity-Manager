import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  age!: string;

  @Column({
    type: 'enum',
    enum: ['Male', 'Female', 'Other'],
    default: 'Other'
  })
  gender!: string;

  @Column({
    type: 'enum',
    enum: ['Single', 'Married', 'Divorced', 'Widowed'],
    default: 'Single'
  })
  maritalStatus!: string;

  @Column({
    type: 'enum',
    enum: ['General', 'OBC', 'SC', 'ST', 'Other'],
    default: 'General'
  })
  caste!: string;

  @Column()
  education!: string;

  @Column()
  occupation!: string;

  @Column()
  location!: string;

  @Column()
  contact!: string;

  @Column({ nullable: true })
  notes?: string;

  @Column()
  email!: string;

  @Column()
  role!: string;

  @Column({ nullable: true })
  bio?: string;

  @Column()
  phoneNumber!: string;

  @Column()
  website!: string;

  @Column()
  socialLinks!: string;

  @Column()
  skills!: string;

  @Column({ nullable: true })
  experience?: string;

  @Column({ default: false })
  isPublic: boolean = false;

  @Column({ default: false })
  isUserProfile: boolean = false;

  @ManyToOne(() => User, user => user.profiles)
  user!: User;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 