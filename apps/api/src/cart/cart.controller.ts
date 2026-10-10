import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Get current user active cart with line items' })
  @Get()
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @ApiOperation({ summary: 'Add product item to cart with stock validation' })
  @Post('items')
  addItem(@Request() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Update cart item quantity (0 deletes the item)' })
  @Patch('items/:id')
  updateItem(
    @Request() req: any,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, itemId, dto);
  }

  @ApiOperation({ summary: 'Remove a specific item from cart' })
  @Delete('items/:id')
  removeItem(@Request() req: any, @Param('id') itemId: string) {
    return this.cartService.removeItem(req.user.id, itemId);
  }

  @ApiOperation({ summary: 'Clear all items from active cart' })
  @Delete()
  clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}