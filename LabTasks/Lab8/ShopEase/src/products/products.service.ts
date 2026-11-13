import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';

interface NewProduct {
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
}

interface Product extends NewProduct {
  id: string;
  currency: 'PKR';
}

const catalog = [
  ['Wireless Headphones', 8999, 'audio', 'photo-1505740420928-5e560c06d30e'],
  ['Smart Watch Pro', 13500, 'wearables', 'photo-1523275335684-37898b6baf30'],
  ['Running Shoes Pro', 4499, 'footwear', 'photo-1542291026-7eec264c27ff'],
  ['Travel Backpack 35L', 6999, 'travel', 'photo-1553062407-98eeb64c6a62'],
  ['Polarized Sunglasses', 2499, 'accessories', 'photo-1572635196237-14b3f281503f'],
  ['Luxury Eau De Parfum', 3999, 'fragrance', 'photo-1592945403244-b3fbafd7f539'],
  ['Urban Casual Sneakers', 5999, 'footwear', 'photo-1491553895911-0055eca6402d'],
  ['Wireless Earbuds Air', 3299, 'audio', 'photo-1590658268037-6bf12165a8df'],
] as const;

@Injectable()
export class ProductsService {
  private readonly products: Product[] = catalog.map(([name, price, category, photo], index) => ({
    id: String(index + 1), name, price, category, stock: 100, currency: 'PKR',
    imageUrl: `https://images.unsplash.com/${photo}?w=500&q=80`,
  }));

  constructor(private readonly categories: CategoriesService) {}

  findAll(q = '', category = '') {
    return this.products.filter(product =>
      product.name.toLowerCase().includes(q.toLowerCase()) &&
      (!category || product.category === category),
    );
  }

  findOne(id: string) {
    const product = this.products.find(product => product.id === id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  create(input: NewProduct) {
    if (typeof input?.name !== 'string' || !input.name.trim() ||
        !Number.isSafeInteger(input.price) || input.price < 1 ||
        !Number.isSafeInteger(input.stock) || input.stock < 0) {
      throw new BadRequestException('Enter a name, a positive whole PKR price, and a nonnegative whole stock quantity');
    }
    if (!this.categories.findAll().includes(input.category)) {
      throw new BadRequestException('Choose an existing category');
    }
    const product: Product = {
      id: String(this.products.length + 1),
      name: input.name.trim(), price: input.price, stock: input.stock,
      category: input.category, currency: 'PKR',
    };
    this.products.push(product);
    return product;
  }
}
