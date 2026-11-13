import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';

interface Delivery {
  name: string;
  phone: string;
  address: string;
  city: string;
  postal?: string;
}

export interface NewOrder {
  delivery: Delivery;
  paymentMethod: 'COD';
}

interface Order extends NewOrder, ReturnType<CartService['getCart']> {
  id: string;
  createdAt: string;
}

@Injectable()
export class OrdersService {
  private readonly orders = new Map<string, Order[]>();

  constructor(private readonly carts: CartService, private readonly products: ProductsService) {}

  findAll(cartId: string) {
    return this.orders.get(cartId) ?? [];
  }

  create(cartId: string, input: NewOrder) {
    const { name, phone, address, city, postal } = input?.delivery ?? {};
    if ([name, phone, address, city].some(value => typeof value !== 'string' || !value.trim())) {
      throw new BadRequestException('Enter a name, phone, address, and city');
    }
    if (input.paymentMethod !== 'COD') throw new BadRequestException('Choose cash on delivery');

    const cart = this.carts.getCart(cartId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');
    for (const item of cart.items) {
      if (item.quantity > this.products.findOne(item.productId).stock) {
        throw new ConflictException(`Insufficient stock for ${item.name}`);
      }
    }
    for (const item of cart.items) {
      this.products.findOne(item.productId).stock -= item.quantity;
    }

    const order: Order = {
      ...cart, id: crypto.randomUUID(), createdAt: new Date().toISOString(), paymentMethod: 'COD',
      delivery: { name, phone, address, city, postal },
    };
    this.orders.set(cartId, [...this.findAll(cartId), order]);
    this.carts.clear(cartId);
    return order;
  }
}
