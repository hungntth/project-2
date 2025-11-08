import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  Inventory,
  InventoryTransaction,
  InventoryTransactionType,
} from './entities/inventory.entity';
import { ImportInventoryDto } from './dto/import-inventory.dto';
import { ExportInventoryDto } from './dto/export-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Injectable()
export class InventoryService {
  private inventory: Map<string, Inventory> = new Map();
  private transactions: InventoryTransaction[] = [];

  findAll(): Inventory[] {
    return Array.from(this.inventory.values());
  }

  findOne(productId: string): Inventory {
    const inventory = this.inventory.get(productId);
    if (!inventory) {
      return {
        id: uuidv4(),
        productId,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        lastUpdated: new Date(),
      };
    }
    return inventory;
  }

  import(importDto: ImportInventoryDto): InventoryTransaction {
    const current = this.findOne(importDto.productId);
    const newQuantity = current.quantity + importDto.quantity;

    const transaction: InventoryTransaction = {
      id: uuidv4(),
      productId: importDto.productId,
      type: InventoryTransactionType.IMPORT,
      quantity: importDto.quantity,
      previousQuantity: current.quantity,
      newQuantity,
      supplierId: importDto.supplierId,
      notes: importDto.notes,
      createdAt: new Date(),
    };

    this.inventory.set(importDto.productId, {
      id: current.id || uuidv4(),
      productId: importDto.productId,
      quantity: newQuantity,
      reservedQuantity: current.reservedQuantity,
      availableQuantity: newQuantity - current.reservedQuantity,
      lastUpdated: new Date(),
    });

    this.transactions.push(transaction);
    return transaction;
  }

  export(exportDto: ExportInventoryDto): InventoryTransaction {
    const current = this.findOne(exportDto.productId);

    if (current.availableQuantity < exportDto.quantity) {
      throw new BadRequestException('Insufficient inventory');
    }

    const newQuantity = current.quantity - exportDto.quantity;

    const transaction: InventoryTransaction = {
      id: uuidv4(),
      productId: exportDto.productId,
      type: InventoryTransactionType.EXPORT,
      quantity: exportDto.quantity,
      previousQuantity: current.quantity,
      newQuantity,
      orderId: exportDto.orderId,
      notes: exportDto.notes,
      createdAt: new Date(),
    };

    this.inventory.set(exportDto.productId, {
      id: current.id || uuidv4(),
      productId: exportDto.productId,
      quantity: newQuantity,
      reservedQuantity: current.reservedQuantity,
      availableQuantity: newQuantity - current.reservedQuantity,
      lastUpdated: new Date(),
    });

    this.transactions.push(transaction);
    return transaction;
  }

  adjust(
    productId: string,
    adjustDto: AdjustInventoryDto,
  ): InventoryTransaction {
    const current = this.findOne(productId);
    const newQuantity = adjustDto.quantity;

    const transaction: InventoryTransaction = {
      id: uuidv4(),
      productId,
      type: InventoryTransactionType.ADJUSTMENT,
      quantity: newQuantity - current.quantity,
      previousQuantity: current.quantity,
      newQuantity,
      reason: adjustDto.reason,
      createdAt: new Date(),
    };

    this.inventory.set(productId, {
      id: current.id || uuidv4(),
      productId,
      quantity: newQuantity,
      reservedQuantity: current.reservedQuantity,
      availableQuantity: newQuantity - current.reservedQuantity,
      lastUpdated: new Date(),
    });

    this.transactions.push(transaction);
    return transaction;
  }

  getLowStock(threshold: number = 10): Inventory[] {
    return Array.from(this.inventory.values()).filter(
      (inv) => inv.availableQuantity <= threshold,
    );
  }

  getHistory(productId?: string): InventoryTransaction[] {
    if (productId) {
      return this.transactions.filter((t) => t.productId === productId);
    }
    return this.transactions;
  }
}
