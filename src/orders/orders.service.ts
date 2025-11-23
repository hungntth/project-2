import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  UpdateOrderStatusDto,
  OrderStatus,
} from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const items = createOrderDto.items.map((item) =>
      this.orderItemsRepository.create({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount ?? 0,
        subtotal: (item.price - (item.discount ?? 0)) * item.quantity,
      }),
    );

    const { subtotal, discount, tax, total } = this.calculateTotals(items);

    const order = this.ordersRepository.create({
      orderNumber: await this.generateOrderNumber(),
      customerId: createOrderDto.customerId,
      employeeId: createOrderDto.employeeId,
      items,
      subtotal,
      discount,
      tax,
      total,
      status: OrderStatus.PENDING,
      notes: createOrderDto.notes,
    });

    return this.ordersRepository.save(order);
  }

  async findAll(
    status?: OrderStatus,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Order[]> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    if (startDate) {
      query.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('order.createdAt <= :endDate', { endDate });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Can only update pending orders');
    }

    if (updateOrderDto.items && updateOrderDto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    if (updateOrderDto.items) {
      order.items = updateOrderDto.items.map((item) =>
        this.orderItemsRepository.create({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount ?? 0,
          subtotal: (item.price - (item.discount ?? 0)) * item.quantity,
        }),
      );
    }

    if (updateOrderDto.customerId !== undefined) {
      order.customerId = updateOrderDto.customerId;
    }

    if (updateOrderDto.employeeId !== undefined) {
      order.employeeId = updateOrderDto.employeeId;
    }

    if (updateOrderDto.notes !== undefined) {
      order.notes = updateOrderDto.notes;
    }

    const { subtotal, discount, tax, total } = this.calculateTotals(
      order.items,
    );
    order.subtotal = subtotal;
    order.discount = discount;
    order.tax = tax;
    order.total = total;

    order.updatedAt = new Date();

    return this.ordersRepository.save(order);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);
    order.status = updateStatusDto.status;
    order.updatedAt = new Date();
    return this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Can only cancel pending or already cancelled orders',
      );
    }

    await this.ordersRepository.remove(order);
  }

  async getInvoice(id: string): Promise<any> {
    const order = await this.findOne(id);
    return {
      invoiceNumber: `INV-${order.orderNumber}`,
      order,
      issuedAt: new Date(),
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  private calculateTotals(items: OrderItem[]): {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = items.reduce(
      (sum, item) => sum + (item.discount || 0) * item.quantity,
      0,
    );
    const tax = subtotal * 0.1;
    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  }
}
