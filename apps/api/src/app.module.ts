import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { User } from './users/entities/user.entity';
import { UserLogin } from './auth/entities/user-login.entity';
import { Product } from './products/entities/product.entity';
import { Category } from './products/entities/category.entity';
import { Cart, CartItem } from './cart/entities/cart.entity';
import { Order, OrderItem } from './orders/entities/order.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(__dirname, '../../../.env'),
        path.resolve(__dirname, '../../../../.env'),
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: '52.14.39.200',
        port: Number(config.get<number>('DB_PORT', 5432)),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        ssl: {
          rejectUnauthorized: false,
          servername: 'ep-snowy-mud-b44fmsix-pooler.c-6.us-east-2.aws.neon.tech',
        },
        entities: [User, UserLogin, Product, Category, Cart, CartItem, Order, OrderItem],
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
  ],
})
export class AppModule {}