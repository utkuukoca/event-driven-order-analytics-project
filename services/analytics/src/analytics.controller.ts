import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('daily')
  async getDaily(): Promise<
    Array<{ date: string; totalOrders: number; totalRevenue: number }>
  > {
    return this.analyticsService.getDailyAnalytics();
  }

  @Get('recent-orders')
  async getRecentOrders(): Promise<
    Array<{ orderId: string; userId: string; price: number; items: string[] }>
  > {
    return this.analyticsService.getRecentOrders();
  }
}
