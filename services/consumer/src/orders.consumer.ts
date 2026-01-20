import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import mongoose, { Model, Schema } from 'mongoose';

interface OrderDocument {
  orderId: string;
  userId: string;
  price: number;
  items: string[];
  createdAt: Date;
}

@Injectable()
export class OrdersConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrdersConsumer.name);
  private readonly consumer: Consumer;
  private readonly topic = process.env.KAFKA_TOPIC ?? 'orders';
  private readonly orderModel: Model<OrderDocument>;

  constructor() {
    const kafka = new Kafka({
      clientId: 'consumer-service',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    });

    this.consumer = kafka.consumer({ groupId: 'order-consumers' });

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
  }

  async onModuleInit(): Promise<void> {
    const mongoUri = process.env.MONGO_URL ?? 'mongodb://localhost:27017/orders';
    await mongoose.connect(mongoUri);

    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }

        const payload = JSON.parse(message.value.toString()) as OrderDocument;
        const order = await this.orderModel.create(payload);
        this.logger.log(`Saved order ${order.orderId} for user ${order.userId}`);
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
    await mongoose.disconnect();
  }
}
