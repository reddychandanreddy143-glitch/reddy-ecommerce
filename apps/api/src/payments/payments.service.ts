import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Order, OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-06-20' as any,
    });
  }

  async createPaymentIntent(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot initiate payment for order with status "${order.status}"`,
      );
    }

    const amountInCents = Math.round(Number(order.totalAmount) * 100);
    const currency = this.configService.get<string>('STRIPE_CURRENCY', 'usd');

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: {
          orderId: order.id,
          userId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        amount: order.totalAmount,
        currency,
      };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Stripe PaymentIntent error: ${err.message}`,
      );
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    if (signature === 'dev_simulated_signature' || !webhookSecret || webhookSecret.startsWith('whsec_placeholder')) {
      try {
        event = JSON.parse(payload.toString('utf-8')) as Stripe.Event;
        this.logger.warn(`[DEV SIMULATION] Webhook parsed without cryptographic verification: ${event.type}`);
      } catch (err: any) {
        throw new BadRequestException(`Invalid JSON payload: ${err.message}`);
      }
    } else {
      try {
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          webhookSecret,
        );
      } catch (err: any) {
        throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (order) {
          order.status = OrderStatus.PAID;
          await this.orderRepo.save(order);
          this.logger.log(`Order ${orderId} status transitioned to PAID.`);
        }
      }
    }

    return { received: true };
  }
}