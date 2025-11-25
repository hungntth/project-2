import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

export enum InventoryTransactionType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column({
    type: 'enum',
    enum: InventoryTransactionType,
  })
  type: InventoryTransactionType;

  @Column('int')
  quantity: number;

  @Column('int')
  previousQuantity: number;

  @Column('int')
  newQuantity: number;

  @Column({ nullable: true })
  supplierId?: string;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier?: Supplier;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true, type: 'text' })
  reason?: string;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column({ nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column('int', { default: 0 })
  quantity: number;

  @Column('int', { default: 0 })
  reservedQuantity: number;

  @Column('int', { default: 0 })
  availableQuantity: number;

  @UpdateDateColumn()
  lastUpdated: Date;
}
