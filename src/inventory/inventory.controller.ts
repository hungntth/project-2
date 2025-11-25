import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ImportInventoryDto } from './dto/import-inventory.dto';
import { ExportInventoryDto } from './dto/export-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.inventoryService.findOne(productId);
  }

  @Get('low-stock/list')
  getLowStock(@Query('threshold') threshold?: string) {
    return this.inventoryService.getLowStock(
      threshold ? parseInt(threshold) : 10,
    );
  }

  @Get('history/list')
  getHistory(@Query('productId') productId?: string) {
    return this.inventoryService.getHistory(productId);
  }

  @Get('period/:period')
  getPeriodInventory(
    @Param('period') period: string,
    @Query('productId') productId?: string,
  ) {
    return this.inventoryService.getPeriodInventory(period, productId);
  }

  @Post('import')
  import(@Body() importDto: ImportInventoryDto) {
    return this.inventoryService.import(importDto);
  }

  @Post('export')
  export(@Body() exportDto: ExportInventoryDto) {
    return this.inventoryService.export(exportDto);
  }

  @Patch(':productId/adjust')
  adjust(
    @Param('productId') productId: string,
    @Body() adjustDto: AdjustInventoryDto,
  ) {
    return this.inventoryService.adjust(productId, adjustDto);
  }
}
