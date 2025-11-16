import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Profile } from './Profile';
import bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin'],
    default: 'user'
  })
  role!: string;

  @OneToMany(() => Profile, profile => profile.user)
  profiles!: Profile[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      console.log('Hashing password:', { passwordLength: this.password.length });
      this.password = await bcrypt.hash(this.password, 10);
      console.log('Password hashed successfully');
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    console.log('Comparing passwords:', {
      candidateLength: candidatePassword.length,
      hashedLength: this.password.length,
      isHashed: this.password.startsWith('$2'),
      candidatePassword: candidatePassword,
      hashedPassword: this.password
    });
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', result);
    return result;
  }
} 