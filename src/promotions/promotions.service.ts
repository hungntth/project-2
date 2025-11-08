import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const startDate = new Date(createPromotionDto.startDate);
    const endDate = new Date(createPromotionDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const promotion = this.promotionRepository.create({
      ...createPromotionDto,
      startDate,
      endDate,
      isActive: new Date() >= startDate && new Date() <= endDate,
    });
    return await this.promotionRepository.save(promotion);
  }

  async findAll(): Promise<Promotion[]> {
    return await this.promotionRepository.find({
      relations: ['product', 'category'],
    });
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['product', 'category'],
    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promotion;
  }

  async update(
    id: string,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    const promotion = await this.findOne(id);
    const updateData: any = { ...updatePromotionDto };

    if (updatePromotionDto.startDate) {
      updateData.startDate = new Date(updatePromotionDto.startDate);
    }
    if (updatePromotionDto.endDate) {
      updateData.endDate = new Date(updatePromotionDto.endDate);
    }

    if (updateData.startDate && updateData.endDate) {
      updateData.isActive =
        new Date() >= updateData.startDate && new Date() <= updateData.endDate;
    }

    await this.promotionRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionRepository.remove(promotion);
  }

  async getActive(): Promise<Promotion[]> {
    const now = new Date();
    return await this.promotionRepository.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      relations: ['product', 'category'],
    });
  }

  async applyPromotion(promotionId: string, orderAmount: number): Promise<any> {
    const promotion = await this.findOne(promotionId);
    if (!promotion.isActive) {
      throw new BadRequestException('Promotion is not active');
    }

    if (
      promotion.minPurchaseAmount &&
      orderAmount < promotion.minPurchaseAmount
    ) {
      throw new BadRequestException(
        'Order amount does not meet minimum requirement',
      );
    }

    let discount = 0;
    if (promotion.type === 'PERCENTAGE') {
      discount = (orderAmount * promotion.value) / 100;
    } else if (promotion.type === 'FIXED_AMOUNT') {
      discount = promotion.value;
    }

    return {
      promotionId: promotion.id,
      promotionName: promotion.name,
      discount,
      finalAmount: orderAmount - discount,
    };
  }
}
