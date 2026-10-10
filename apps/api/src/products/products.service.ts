import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // Category Operations
  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepo.findOne({ where: [{ name: dto.name }, { slug: dto.slug }] });
    if (existing) {
      throw new ConflictException('Category with this name or slug already exists');
    }
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepo.find({ relations: ['products'] });
  }

  // Product Operations
  async createProduct(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAllProducts(): Promise<Product[]> {
    return this.productRepo.find({ relations: ['category'] });
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findProductById(id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const product = await this.findProductById(id);
    await this.productRepo.remove(product);
    return { message: `Product "${id}" deleted successfully` };
  }
}