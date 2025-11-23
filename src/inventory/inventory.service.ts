import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
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
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryTransaction)
    private readonly transactionRepository: Repository<InventoryTransaction>,
  ) {}

  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      relations: ['product'],
      order: { lastUpdated: 'DESC' },
    });
  }

  async findOne(productId: string): Promise<Inventory> {
    return this.ensureInventory(productId, true);
  }

  async import(importDto: ImportInventoryDto): Promise<InventoryTransaction> {
    const current = await this.ensureInventory(importDto.productId);
    const newQuantity = current.quantity + importDto.quantity;

    await this.inventoryRepository.save({
      ...current,
      reservedQuantity: current.reservedQuantity,
      quantity: newQuantity,
      availableQuantity: newQuantity - current.reservedQuantity,
    });

    const transaction = this.transactionRepository.create({
      productId: importDto.productId,
      type: InventoryTransactionType.IMPORT,
      quantity: importDto.quantity,
      previousQuantity: current.quantity,
      newQuantity,
      supplierId: importDto.supplierId,
      notes: importDto.notes,
    });

    return this.transactionRepository.save(transaction);
  }

  async export(exportDto: ExportInventoryDto): Promise<InventoryTransaction> {
    const current = await this.ensureInventory(exportDto.productId);

    if (current.availableQuantity < exportDto.quantity) {
      throw new BadRequestException('Insufficient inventory');
    }

    const newQuantity = current.quantity - exportDto.quantity;

    await this.inventoryRepository.save({
      ...current,
      quantity: newQuantity,
      availableQuantity: newQuantity - current.reservedQuantity,
    });

    const transaction = this.transactionRepository.create({
      productId: exportDto.productId,
      type: InventoryTransactionType.EXPORT,
      quantity: exportDto.quantity,
      previousQuantity: current.quantity,
      newQuantity,
      orderId: exportDto.orderId,
      notes: exportDto.notes,
    });

    return this.transactionRepository.save(transaction);
  }

  async adjust(
    productId: string,
    adjustDto: AdjustInventoryDto,
  ): Promise<InventoryTransaction> {
    const current = await this.ensureInventory(productId);
    const newQuantity = adjustDto.quantity;

    await this.inventoryRepository.save({
      ...current,
      quantity: newQuantity,
      availableQuantity: newQuantity - current.reservedQuantity,
    });

    const transaction = this.transactionRepository.create({
      productId,
      type: InventoryTransactionType.ADJUSTMENT,
      quantity: newQuantity - current.quantity,
      previousQuantity: current.quantity,
      newQuantity,
      reason: adjustDto.reason,
    });

    return this.transactionRepository.save(transaction);
  }

  async getLowStock(threshold: number = 10): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: {
        availableQuantity: LessThanOrEqual(threshold),
      },
      relations: ['product'],
      order: { availableQuantity: 'ASC' },
    });
  }

  async getHistory(productId?: string): Promise<InventoryTransaction[]> {
    const where = productId ? { productId } : {};
    return this.transactionRepository.find({
      where,
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  private async ensureInventory(
    productId: string,
    includeRelations = false,
  ): Promise<Inventory> {
    let inventory = await this.inventoryRepository.findOne({
      where: { productId },
      relations: includeRelations ? ['product'] : undefined,
    });

    if (!inventory) {
      await this.inventoryRepository.save(
        this.inventoryRepository.create({
          productId,
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
        }),
      );
      inventory = await this.inventoryRepository.findOneOrFail({
        where: { productId },
        relations: includeRelations ? ['product'] : undefined,
      });
    }

    return inventory!;
  }
}
