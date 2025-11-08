import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { QueryReportDto } from './dto/query-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.reportsService.getDashboard();
  }

  @Get('sales')
  getSalesReport(@Query() query: QueryReportDto) {
    return this.reportsService.getSalesReport(query);
  }

  @Get('products')
  getProductsReport(@Query() query: QueryReportDto) {
    return this.reportsService.getProductsReport(query);
  }

  @Get('customers')
  getCustomersReport(@Query() query: QueryReportDto) {
    return this.reportsService.getCustomersReport(query);
  }

  @Get('inventory')
  getInventoryReport() {
    return this.reportsService.getInventoryReport();
  }

  @Get('revenue')
  getRevenueReport(@Query() query: QueryReportDto) {
    return this.reportsService.getRevenueReport(query);
  }

  @Get('profit')
  getProfitReport(@Query() query: QueryReportDto) {
    return this.reportsService.getProfitReport(query);
  }
}
