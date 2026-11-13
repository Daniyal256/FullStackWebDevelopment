import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { NewOrder, OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findAll(@Query('cartId') cartId = 'demo') {
    return this.orders.findAll(cartId);
  }

  @Post()
  create(@Query('cartId') cartId = 'demo', @Body() order: NewOrder) {
    return this.orders.create(cartId, order);
  }
}
