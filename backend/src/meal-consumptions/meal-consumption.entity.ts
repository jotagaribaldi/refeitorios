import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { Restaurant } from '../restaurants/restaurant.entity';
import { MealType } from '../meal-types/meal-type.entity';

@Entity('meal_consumptions')
export class MealConsumption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (t) => t.consumptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u.consumptions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  restaurantId: string;

  @ManyToOne(() => Restaurant, (r) => r.consumptions)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column()
  mealTypeId: string;

  @ManyToOne(() => MealType, (m) => m.consumptions)
  @JoinColumn({ name: 'meal_type_id' })
  mealType: MealType;

  @Column({ name: 'consumed_at', type: 'timestamp', default: () => 'NOW()' })
  consumedAt: Date;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
