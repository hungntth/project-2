import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  findAll() {
    return this.promotionsService.findAll();
  }

  @Get('active')
  getActive() {
    return this.promotionsService.getActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Post(':id/apply')
  applyPromotion(
    @Param('id') id: string,
    @Body('orderAmount') orderAmount: number,
  ) {
    return this.promotionsService.applyPromotion(id, orderAmount);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.promotionsService.remove(id);
    return { message: 'Promotion deleted successfully' };
  }
}
