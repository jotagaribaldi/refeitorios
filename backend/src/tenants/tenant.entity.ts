import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { MealTimeWindow } from '../meal-types/meal-time-window.entity';
import { MonthlyAllowance } from '../monthly-allowances/monthly-allowance.entity';
import { MealConsumption } from '../meal-consumptions/meal-consumption.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 20, nullable: true, unique: true })
  cnpj: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (u) => u.tenant)
  users: User[];

  @OneToMany(() => Restaurant, (r) => r.tenant)
  restaurants: Restaurant[];

  @OneToMany(() => MealTimeWindow, (m) => m.tenant)
  mealTimeWindows: MealTimeWindow[];

  @OneToMany(() => MonthlyAllowance, (a) => a.tenant)
  allowances: MonthlyAllowance[];

  @OneToMany(() => MealConsumption, (c) => c.tenant)
  consumptions: MealConsumption[];
}
