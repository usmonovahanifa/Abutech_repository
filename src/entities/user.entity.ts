import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  EMPLOYEE = 'employee',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  full_name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'text', nullable: true})
  refresh_token: string;

  @Column({ type: 'enum', enum: UserRole, default: 'employee' })
  role: UserRole;
}
