import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import Redis from 'ioredis';

export interface OrderPayload {
  orderId: string;
  userId: string;
  price: number;
  items: string[];
}

@Injectable()
export class OrdersService implements OnModuleInit, OnModuleDestroy {
  private readonly producer: Producer;
  private readonly redis: Redis;
  private readonly topic = process.env.KAFKA_TOPIC ?? 'orders';

  constructor() {
    const kafka = new Kafka({
      clientId: 'api-service',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    });

    this.producer = kafka.producer();
    this.redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
    await this.redis.quit();
  }

  async enqueueOrder(order: OrderPayload): Promise<void> {
    await this.producer.send({
      topic: this.topic,
      messages: [{ value: JSON.stringify(order) }],
    });

    const listKey = 'orders:recent';
    await this.redis.lpush(listKey, JSON.stringify(order));
    await this.redis.ltrim(listKey, 0, 9);
  }
}
