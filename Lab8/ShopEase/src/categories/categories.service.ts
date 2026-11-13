import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  private readonly categories = ['audio', 'wearables', 'footwear', 'travel', 'accessories', 'fragrance'];

  findAll() {
    return this.categories;
  }

  create(name: string) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new BadRequestException('Enter a category name');
    }
    const category = name.trim().toLowerCase();
    if (this.categories.includes(category)) throw new ConflictException('Category already exists');
    this.categories.push(category);
    return category;
  }
}
