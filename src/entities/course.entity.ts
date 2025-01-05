import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum CourseLevel {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
  }
  
@Entity()
export class Course {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'enum', enum: CourseLevel })
  level: CourseLevel;
}