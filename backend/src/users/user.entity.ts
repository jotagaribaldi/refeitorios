import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { MonthlyAllowance } from '../monthly-allowances/monthly-allowance.entity';
import { MealConsumption } from '../meal-consumptions/meal-consumption.entity';
import { Restaurant } from '../restaurants/restaurant.entity';

export enum UserRole {
  ROOT = 'ROOT',
  GERENTE = 'GERENTE',
  FUNCIONARIO = 'FUNCIONARIO',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { nullable: true, onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.FUNCIONARIO })
  role: UserRole;

  @Column({ name: 'employee_code', length: 50, nullable: true })
  employeeCode: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MonthlyAllowance, (a) => a.user)
  allowances: MonthlyAllowance[];

  @OneToMany(() => MealConsumption, (c) => c.user)
  consumptions: MealConsumption[];

  // Refeitórios nos quais o funcionário pode realizar refeições
  @ManyToMany(() => Restaurant, { eager: false, cascade: false })
  @JoinTable({
    name: 'user_allowed_restaurants',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'restaurant_id', referencedColumnName: 'id' },
  })
  allowedRestaurants: Restaurant[];
}
