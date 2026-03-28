import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';

@Entity('monthly_allowances')
@Unique(['userId', 'year', 'month'])
export class MonthlyAllowance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (t) => t.allowances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u.allowances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column({ name: 'total_allowance', default: 0 })
  totalAllowance: number;

  @Column({ default: 0 })
  consumed: number;
}
