import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import {
  Inventory,
  InventoryTransaction,
  InventoryTransactionType,
} from './entities/inventory.entity';
import { InventoryPeriod } from './entities/inventory-period.entity';
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
    @InjectRepository(InventoryPeriod)
    private readonly periodRepository: Repository<InventoryPeriod>,
  ) {}

  async findAll(): Promise<Inventory[]> {
    const inventories = await this.inventoryRepository.find({
      relations: ['product'],
      order: { lastUpdated: 'DESC' },
    });

    // Cập nhật availableQuantity từ tồn kho cuối kỳ hiện tại
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    for (const inv of inventories) {
      const period = await this.periodRepository.findOne({
        where: { productId: inv.productId, period: currentPeriod },
      });
      if (period) {
        // availableQuantity = closingBalance - reservedQuantity (từ inventory table)
        inv.availableQuantity = period.closingBalance - inv.reservedQuantity;
      } else {
        // Nếu không có period, tính từ quantity hiện tại
        inv.availableQuantity = inv.quantity - inv.reservedQuantity;
      }
    }

    return inventories;
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

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Cập nhật tồn kho theo kỳ
    await this.updatePeriodInventory(
      importDto.productId,
      InventoryTransactionType.IMPORT,
      importDto.quantity,
      current.quantity,
      newQuantity,
    );

    return savedTransaction;
  }

  async export(exportDto: ExportInventoryDto): Promise<InventoryTransaction> {
    const current = await this.ensureInventory(exportDto.productId);

    // Kiểm tra tồn kho khả dụng từ kỳ hiện tại
    const currentPeriod = new Date().toISOString().slice(0, 7);
    const period = await this.periodRepository.findOne({
      where: { productId: exportDto.productId, period: currentPeriod },
    });

    const availableQty = period
      ? period.availableQuantity
      : current.availableQuantity;

    if (availableQty < exportDto.quantity) {
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

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Cập nhật tồn kho theo kỳ
    await this.updatePeriodInventory(
      exportDto.productId,
      InventoryTransactionType.EXPORT,
      exportDto.quantity,
      current.quantity,
      newQuantity,
    );

    return savedTransaction;
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

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Cập nhật tồn kho theo kỳ
    await this.updatePeriodInventory(
      productId,
      InventoryTransactionType.ADJUSTMENT,
      newQuantity - current.quantity,
      current.quantity,
      newQuantity,
    );

    return savedTransaction;
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

  async getPeriodInventory(
    period: string,
    productId?: string,
  ): Promise<InventoryPeriod[]> {
    const where: any = { period };
    if (productId) {
      where.productId = productId;
    }
    return this.periodRepository.find({
      where,
      relations: ['product'],
      order: { productId: 'ASC' },
    });
  }

  private async updatePeriodInventory(
    productId: string,
    type: InventoryTransactionType,
    quantity: number,
    previousQuantity: number,
    newQuantity: number,
  ): Promise<void> {
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    let period = await this.periodRepository.findOne({
      where: { productId, period: currentPeriod },
    });

    if (!period) {
      // Tính tồn kho đầu kỳ từ kỳ trước hoặc từ transactions
      const previousPeriod = await this.getPreviousPeriodClosingBalance(
        productId,
        currentPeriod,
      );

      period = this.periodRepository.create({
        productId,
        period: currentPeriod,
        openingBalance: previousPeriod,
        totalImport: 0,
        totalExport: 0,
        closingBalance: previousPeriod,
        reservedQuantity: 0,
        availableQuantity: previousPeriod,
      });
    }

    // Cập nhật theo loại giao dịch
    if (type === InventoryTransactionType.IMPORT) {
      period.totalImport += quantity;
    } else if (type === InventoryTransactionType.EXPORT) {
      period.totalExport += quantity;
    } else if (type === InventoryTransactionType.ADJUSTMENT) {
      // Điều chỉnh: cập nhật opening balance và tính lại
      period.openingBalance = previousQuantity;
      period.totalImport = 0;
      period.totalExport = 0;
    }

    period.closingBalance =
      period.openingBalance + period.totalImport - period.totalExport;
    // availableQuantity sẽ được tính ở findAll() hoặc frontend
    // vì cần reservedQuantity từ inventory table (số đã đặt hiện tại)
    // period.availableQuantity sẽ không được dùng, nhưng vẫn lưu để tham khảo
    period.availableQuantity = period.closingBalance - period.reservedQuantity;

    await this.periodRepository.save(period);
  }

  private async getPreviousPeriodClosingBalance(
    productId: string,
    currentPeriod: string,
  ): Promise<number> {
    // Tìm kỳ trước đó
    const [year, month] = currentPeriod.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const previousPeriod = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const prevPeriod = await this.periodRepository.findOne({
      where: { productId, period: previousPeriod },
    });

    if (prevPeriod) {
      return prevPeriod.closingBalance;
    }

    // Nếu không có kỳ trước, tính từ transactions
    const allTransactions = await this.transactionRepository.find({
      where: { productId },
      order: { createdAt: 'ASC' },
    });

    const periodDate = new Date(`${currentPeriod}-01`);
    const periodStart = new Date(
      periodDate.getFullYear(),
      periodDate.getMonth(),
      1,
    );

    let balance = 0;
    for (const t of allTransactions) {
      if (new Date(t.createdAt) < periodStart) {
        if (t.type === InventoryTransactionType.IMPORT) {
          balance += t.quantity;
        } else if (t.type === InventoryTransactionType.EXPORT) {
          balance -= t.quantity;
        } else if (t.type === InventoryTransactionType.ADJUSTMENT) {
          balance = t.newQuantity;
        }
      }
    }

    return balance;
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
