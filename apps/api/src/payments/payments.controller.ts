import {
  Controller,
  Post,
  Param,
  Headers,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create Stripe PaymentIntent for a pending order' })
  @Post('create-intent/:orderId')
  createPaymentIntent(@Req() req: any, @Param('orderId') orderId: string) {
    return this.paymentsService.createPaymentIntent(req.user.id, orderId);
  }

  @ApiOperation({ summary: 'Stripe webhook receiver for asynchronous payment events' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Cryptographic signature from Stripe for webhook payload verification',
    required: true,
  })
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body not accessible for webhook verification');
    }

    return this.paymentsService.handleWebhook(signature, rawBody);
  }
}