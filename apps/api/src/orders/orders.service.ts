import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';

export interface BookNowDto {
  productId?: string;
  productTitle: string;
  price: number;
  deliveryAddress: string;
  customerName?: string;
  customerEmail?: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  private extractUserId(userPayload: any): string {
    const id = userPayload?.id || userPayload?.sub || userPayload?.userId;
    if (!id) {
      throw new UnauthorizedException('Invalid user authentication token.');
    }
    return String(id);
  }

  async bookNow(userPayload: any, dto: BookNowDto) {
    if (!dto.deliveryAddress || dto.deliveryAddress.trim().length < 5) {
      throw new BadRequestException('Please provide a complete delivery address.');
    }

    const userId = this.extractUserId(userPayload);
    const dbUser = await this.userRepo.findOne({ where: { id: userId } });

    const finalEmail = dbUser?.email || userPayload?.email || dto.customerEmail || '';
    const finalName = dbUser?.name || userPayload?.name || dto.customerName || 'Customer';

    const minDays = 5;
    const maxDays = 7;
    const daysRange = `${minDays} to ${maxDays} business days`;

    const newOrder = this.orderRepo.create({
      userId: userId,
      status: OrderStatus.CONFIRMED,
      totalAmount: Number(dto.price),
      deliveryAddress: dto.deliveryAddress,
      customerName: finalName,
      customerEmail: finalEmail,
      paymentMethod: 'Cash on Delivery',
      productSummary: dto.productTitle,
    });

    const savedOrder = await this.orderRepo.save(newOrder);
    this.logger.log(`Order ${savedOrder.id} isolated to User ID: ${userId} (${finalEmail})`);

    if (finalEmail) {
      this.mailService
        .sendOrderConfirmationEmail({
          to: finalEmail,
          customerName: finalName,
          productTitle: dto.productTitle,
          price: dto.price,
          deliveryAddress: dto.deliveryAddress,
          deliveryDays: daysRange,
        })
        .catch((err) => {
          this.logger.error(`Error sending email: ${err.message}`);
        });
    }

    return {
      success: true,
      orderId: savedOrder.id,
      order: savedOrder,
      message: 'Order booked successfully! Cash on Delivery confirmed.',
      deliveryDays: daysRange,
      paymentMethod: 'Cash on Delivery',
    };
  }

  async getUserOrders(userPayload: any): Promise<Order[]> {
    const userId = this.extractUserId(userPayload);

    // Strictly isolated query: only return orders that belong to THIS user ID
    return this.orderRepo.find({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  async cancelOrder(userPayload: any, orderId: string): Promise<Order> {
    const userId = this.extractUserId(userPayload);
    const order = await this.orderRepo.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Security check: ensure user owns this order
    if (order.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to cancel this order.');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Delivered orders cannot be cancelled.');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled.');
    }

    order.status = OrderStatus.CANCELLED;
    const updated = await this.orderRepo.save(order);

    if (order.customerEmail) {
      this.mailService
        .sendOrderCancelledEmail({
          to: order.customerEmail,
          customerName: order.customerName || 'Customer',
          orderId: order.id,
          productTitle: order.productSummary || 'Store Item',
          totalAmount: Number(order.totalAmount || 0),
        })
        .catch((err) => {
          this.logger.error(`Cancellation email dispatch error: ${err.message}`);
        });
    }

    return updated;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    order.status = status;
    return this.orderRepo.save(order);
  }
}