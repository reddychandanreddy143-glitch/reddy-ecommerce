import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { OrdersService, BookNowDto } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderStatus } from './entities/order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('book-now')
  async bookNow(@Request() req: any, @Body() dto: BookNowDto) {
    return this.ordersService.bookNow(req.user, dto);
  }

  @Get('my-orders')
  async getMyOrders(@Request() req: any) {
    return this.ordersService.getUserOrders(req.user);
  }

  @Get('admin/all')
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Patch(':id/cancel')
  async cancelOrder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(req.user, id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(id, status);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }
}