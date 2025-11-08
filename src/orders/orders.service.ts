import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  UpdateOrderStatusDto,
  OrderStatus,
} from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private orderCounter = 1;

  create(createOrderDto: CreateOrderDto): Order {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const items: OrderItem[] = createOrderDto.items.map((item) => {
      const orderItem = new OrderItem();
      orderItem.productId = item.productId;
      orderItem.quantity = item.quantity;
      orderItem.price = item.price;
      orderItem.discount = item.discount || 0;
      orderItem.subtotal = (item.price - (item.discount || 0)) * item.quantity;
      return orderItem;
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = items.reduce(
      (sum, item) => sum + (item.discount || 0) * item.quantity,
      0,
    );
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal - discount + tax;

    const order: Order = {
      id: uuidv4(),
      orderNumber: `ORD-${String(this.orderCounter++).padStart(6, '0')}`,
      customerId: createOrderDto.customerId,
      employeeId: createOrderDto.employeeId,
      items,
      subtotal,
      discount,
      tax,
      total,
      status: OrderStatus.PENDING,
      notes: createOrderDto.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.push(order);
    return order;
  }

  findAll(status?: OrderStatus, startDate?: Date, endDate?: Date): Order[] {
    let filtered = [...this.orders];

    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }

    if (startDate) {
      filtered = filtered.filter((o) => o.createdAt >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((o) => o.createdAt <= endDate);
    }

    return filtered;
  }

  findOne(id: string): Order {
    const order = this.orders.find((o) => o.id === id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  update(id: string, updateOrderDto: UpdateOrderDto): Order {
    const order = this.findOne(id);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Can only update pending orders');
    }
    Object.assign(order, updateOrderDto, { updatedAt: new Date() });
    return order;
  }

  updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Order {
    const order = this.findOne(id);
    order.status = updateStatusDto.status;
    order.updatedAt = new Date();
    return order;
  }

  remove(id: string): void {
    const order = this.findOne(id);
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Can only cancel pending or already cancelled orders',
      );
    }
    const index = this.orders.findIndex((o) => o.id === id);
    this.orders.splice(index, 1);
  }

  getInvoice(id: string): any {
    const order = this.findOne(id);
    return {
      invoiceNumber: `INV-${order.orderNumber}`,
      order,
      issuedAt: new Date(),
    };
  }
}
