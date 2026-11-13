import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

interface CartItem {
  productId: string;
  quantity: number;
}

@Injectable()
export class CartService {
  private readonly carts = new Map<string, CartItem[]>();

  constructor(private readonly products: ProductsService) {}

  getCart(cartId: string) {
    const items = (this.carts.get(cartId) ?? []).map(item => {
      const { name, price, imageUrl } = this.products.findOne(item.productId);
      return { ...item, name, price, imageUrl, lineTotal: price * item.quantity };
    });
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = items.length > 0 && subtotal < 2000 ? 200 : 0;
    return { items, subtotal, shipping, total: subtotal + shipping, currency: 'PKR' };
  }

  add(cartId: string, productId: string, quantity: number) {
    this.checkQuantity(quantity);
    const items = this.carts.get(cartId) ?? [];
    const item = items.find(item => item.productId === productId);
    const total = (item?.quantity ?? 0) + quantity;
    this.checkStock(productId, total);
    if (item) item.quantity = total;
    else items.push({ productId, quantity });
    this.carts.set(cartId, items);
    return this.getCart(cartId);
  }

  update(cartId: string, productId: string, quantity: number) {
    const item = this.carts.get(cartId)?.find(item => item.productId === productId);
    if (!item) throw new NotFoundException('Cart item not found');
    this.checkStock(productId, quantity);
    item.quantity = quantity;
    return this.getCart(cartId);
  }

  remove(cartId: string, productId: string) {
    const items = this.carts.get(cartId) ?? [];
    const remaining = items.filter(item => item.productId !== productId);
    if (remaining.length === items.length) throw new NotFoundException('Cart item not found');
    this.carts.set(cartId, remaining);
    return this.getCart(cartId);
  }

  clear(cartId: string) {
    this.carts.delete(cartId);
  }

  private checkQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new BadRequestException('Quantity must be a whole number from 1 to 99');
    }
  }

  private checkStock(productId: string, quantity: number) {
    this.checkQuantity(quantity);
    if (quantity > this.products.findOne(productId).stock) {
      throw new ConflictException('Insufficient stock');
    }
  }
}
