import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..');
const pages = [
  'index.html', 'login.html', 'signup.html', 'cart.html',
  'edit-cart.html', 'checkout.html', 'review-order.html',
];

@Controller()
export class AppController {
  @Get()
  index(@Res() response: Response) {
    response.sendFile('index.html', { root });
  }

  @Get('assets/js/app.js')
  script(@Res() response: Response) {
    response.sendFile('assets/js/app.js', { root });
  }

  @Get(':page.html')
  page(@Param('page') name: string, @Res() response: Response) {
    const file = `${name}.html`;
    if (!pages.includes(file)) throw new NotFoundException();
    response.sendFile(file, { root });
  }
}
