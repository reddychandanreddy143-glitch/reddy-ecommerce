import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem } from './entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepo.create({ userId, items: [] });
      cart = await this.cartRepo.save(cart);
    } else if (cart.items && cart.items.length > 0) {
      // Automatically clean up any corrupted or orphaned cart items from the database
      const invalidItems = cart.items.filter((item) => !item.product || !item.product.title);
      if (invalidItems.length > 0) {
        await this.cartItemRepo.remove(invalidItems);
        cart.items = cart.items.filter((item) => item.product && item.product.title);
      }
    }

    return cart;
  }

  async addItem(userId: string, dto: AddToCartDto): Promise<Cart> {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID "${dto.productId}" not found`);
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException(`Insufficient stock. Only ${product.stock} items available.`);
    }

    const cart = await this.getCart(userId);
    let item = cart.items.find((i) => i.productId === dto.productId);

    if (item) {
      const newQuantity = item.quantity + dto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Insufficient stock. Only ${product.stock} available.`);
      }
      item.quantity = newQuantity;
      await this.cartItemRepo.save(item);
    } else {
      item = this.cartItemRepo.create({
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      });
      await this.cartItemRepo.save(item);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException(`Cart item "${itemId}" not found`);
    }

    if (dto.quantity === 0) {
      await this.cartItemRepo.remove(item);
    } else {
      const product = await this.productRepo.findOne({ where: { id: item.productId } });
      if (product && product.stock < dto.quantity) {
        throw new BadRequestException(`Insufficient stock. Only ${product.stock} available.`);
      }
      item.quantity = dto.quantity;
      await this.cartItemRepo.save(item);
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException(`Cart item "${itemId}" not found`);
    }

    await this.cartItemRepo.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<{ message: string }> {
    const cart = await this.getCart(userId);
    await this.cartItemRepo.delete({ cartId: cart.id });
    return { message: 'Cart cleared successfully' };
  }
}