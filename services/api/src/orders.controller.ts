import { Body, Controller, Post } from '@nestjs/common';
import { OrderPayload, OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() order: OrderPayload): Promise<{ status: string }> {
    await this.ordersService.enqueueOrder(order);
    return { status: 'queued' };
  }
}
