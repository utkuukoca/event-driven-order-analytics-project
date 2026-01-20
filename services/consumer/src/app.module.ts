import { Module } from '@nestjs/common';
import { OrdersConsumer } from './orders.consumer';

@Module({
  providers: [OrdersConsumer],
})
export class AppModule {}
