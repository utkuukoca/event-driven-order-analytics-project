import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import mongoose, { Model, Schema } from 'mongoose';
import Redis from 'ioredis';

interface OrderDocument {
  orderId: string;
  userId: string;
  price: number;
  items: string[];
  createdAt: Date;
}

@Injectable()
export class AnalyticsService implements OnModuleInit, OnModuleDestroy {
  private readonly orderModel: Model<OrderDocument>;
  private readonly redis: Redis;

  constructor() {
    const orderSchema = new Schema<OrderDocument>(
      {
        orderId: { type: String, required: true },
        userId: { type: String, required: true },
        price: { type: Number, required: true },
        items: { type: [String], required: true },
        createdAt: { type: Date, default: Date.now },
      },
      { collection: 'orders' },
    );

    this.orderModel = mongoose.model<OrderDocument>('Order', orderSchema);
    this.redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  }

  async onModuleInit(): Promise<void> {
    const mongoUri = process.env.MONGO_URL ?? 'mongodb://localhost:27017/orders';
    await mongoose.connect(mongoUri);
  }

  async onModuleDestroy(): Promise<void> {
    await mongoose.disconnect();
    await this.redis.quit();
  }

  async getDailyAnalytics(): Promise<
    Array<{ date: string; totalOrders: number; totalRevenue: number }>
  > {
    const results = await this.orderModel.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return results.map((entry) => ({
      date: entry._id as string,
      totalOrders: entry.totalOrders as number,
      totalRevenue: entry.totalRevenue as number,
    }));
  }

  async getRecentOrders(): Promise<OrderDocument[]> {
    const listKey = 'orders:recent';
    const items = await this.redis.lrange(listKey, 0, 9);
    return items.map((item) => JSON.parse(item) as OrderDocument);
  }
}
