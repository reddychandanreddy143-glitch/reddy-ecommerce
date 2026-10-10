import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'electronics', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Gadgets and devices', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Gaming Laptop' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'High performance laptop', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1299.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'uuid-category-id' })
  @IsString()
  categoryId: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}