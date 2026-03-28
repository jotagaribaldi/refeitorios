import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique,
} from 'typeorm';
import { MealTimeWindow } from './meal-time-window.entity';
import { MealConsumption } from '../meal-consumptions/meal-consumption.entity';

@Entity('meal_types')
@Unique(['slug', 'tenantId'])
export class MealType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  slug: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @OneToMany(() => MealTimeWindow, (w) => w.mealType)
  timeWindows: MealTimeWindow[];

  @OneToMany(() => MealConsumption, (c) => c.mealType)
  consumptions: MealConsumption[];
}
