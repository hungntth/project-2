import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('inventory_periods')
@Unique(['productId', 'period'])
export class InventoryPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column({ type: 'varchar', length: 7 })
  period: string; // Format: YYYY-MM

  @Column('int', { default: 0 })
  openingBalance: number; // Tồn kho đầu kỳ

  @Column('int', { default: 0 })
  totalImport: number; // Tổng nhập trong kỳ

  @Column('int', { default: 0 })
  totalExport: number; // Tổng xuất trong kỳ

  @Column('int', { default: 0 })
  closingBalance: number; // Tồn kho cuối kỳ

  @Column('int', { default: 0 })
  reservedQuantity: number; // Số lượng đã đặt trong kỳ

  @Column('int', { default: 0 })
  availableQuantity: number; // Số lượng khả dụng = closingBalance - reservedQuantity

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

