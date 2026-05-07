import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { MealType } from './meal-type.entity';
import { Restaurant } from '../restaurants/restaurant.entity';

@Entity('meal_time_windows')
@Unique(['restaurantId', 'mealTypeId'])
export class MealTimeWindow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (t) => t.mealTimeWindows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ name: 'meal_type_id' })
  mealTypeId: string;

  @ManyToOne(() => MealType, (m) => m.timeWindows)
  @JoinColumn({ name: 'meal_type_id' })
  mealType: MealType;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'allow_duplicate', default: false })
  allowDuplicate: boolean;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;
}
