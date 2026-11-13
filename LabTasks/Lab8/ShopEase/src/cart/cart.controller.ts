import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly carts: CartService) {}

  @Get()
  getCart(@Query('cartId') cartId = 'demo') {
    return this.carts.getCart(cartId);
  }

  @Post()
  add(@Query('cartId') cartId = 'demo', @Body('productId') productId: string, @Body('quantity') quantity = 1) {
    return this.carts.add(cartId, productId, quantity);
  }

  @Patch('items/:id')
  update(@Query('cartId') cartId = 'demo', @Param('id') id: string, @Body('quantity') quantity: number) {
    return this.carts.update(cartId, id, quantity);
  }

  @Delete('items/:id')
  remove(@Query('cartId') cartId = 'demo', @Param('id') id: string) {
    return this.carts.remove(cartId, id);
  }
}
