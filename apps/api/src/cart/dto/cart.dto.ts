import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'product-uuid-here' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class AddCartItemDto extends AddToCartDto {}

export class UpdateCartItemDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  quantity: number;
}