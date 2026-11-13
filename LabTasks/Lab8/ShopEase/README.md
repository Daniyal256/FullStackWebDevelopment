# ShopEase NestJS Lab

ShopEase uses its existing HTML, Bootstrap 5, CSS, and vanilla JavaScript storefront with a NestJS 11 backend written in TypeScript.

The original pages cover browsing eight products, signup and login, viewing and editing a cart, entering delivery details, and confirming a cash-on-delivery order. The backend has Products, Categories, Cart, and Orders modules. The category endpoints manage the catalog’s category names. The existing homepage category cards remain static.

Signup, login, and checkout drafts use browser localStorage. Create a demo account in the browser where you plan to shop. Accounts from the previous JSON-backed server aren’t imported. The server keeps catalog changes, carts, and orders in memory and resets them on restart. The previous `data/store.json`, if present, is left on disk and isn’t used by this version.

## Run locally

Use Node.js 22 or newer. From the project directory:

```bash
npm install
npm start
```

Open [the storefront](http://localhost:3000/) or [the products API](http://localhost:3000/products). The same server serves both. Run `npm run build` to compile TypeScript or `npm test` to compile and run the API integration tests.

## Folder structure

```text
ShopEase/
├── assets/
│   └── js/
│       └── app.js
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── main.ts
│   ├── cart/
│   │   ├── cart.controller.ts
│   │   ├── cart.module.ts
│   │   └── cart.service.ts
│   ├── categories/
│   │   ├── categories.controller.ts
│   │   ├── categories.module.ts
│   │   └── categories.service.ts
│   ├── orders/
│   │   ├── orders.controller.ts
│   │   ├── orders.module.ts
│   │   └── orders.service.ts
│   └── products/
│       ├── products.controller.ts
│       ├── products.module.ts
│       └── products.service.ts
├── tests/
│   └── api.test.js
├── .gitignore
├── cart.html
├── checkout.html
├── edit-cart.html
├── index.html
├── login.html
├── package-lock.json
├── package.json
├── README.md
├── review-order.html
├── signup.html
└── tsconfig.json
```

`dist/` and `node_modules/` are generated locally and excluded from Git.

## How the files fit together

- `main.ts` starts NestJS. `app.module.ts` imports the four feature modules. `app.controller.ts` serves the existing pages and frontend script.
- Each feature controller defines its routes and calls its service. Each feature module registers its controller and service. The Categories module exports its service for Products. Products exports its service for Cart and Orders. Cart exports its service for Orders.
- The feature services hold data in memory. Orders calculates totals from the cart, reduces stock, and clears the cart after checkout.
- `assets/js/app.js` calls the NestJS API with `fetch()`. It also manages browser-local demo accounts and checkout drafts. `index.html` wraps its existing storefront sections in a `main` element so the script can initialize and display messages.
- `tsconfig.json`, npm scripts, and the lockfile configure the TypeScript build. The JavaScript backend was replaced, and `tests/api.test.js` now exercises the TypeScript backend over HTTP.

## Postman requests

Use `http://localhost:3000` as the base URL. For POST and PATCH, select **Body → raw → JSON**. Requests without a `cartId` query parameter use a shared demo cart and order list. In the storefront, each browser-local demo account supplies its own cart ID. The ID groups records and provides no access control.

| Method | Path | Sample JSON body or result |
| --- | --- | --- |
| GET | `/categories` | Lists category names. |
| POST | `/categories` | `{"name":"fitness"}` |
| GET | `/products` | Lists products. Try `/products?q=yoga&category=fitness` after adding the example product. |
| GET | `/products/1` | Returns Wireless Headphones. Use the returned ID to look up a newly added product. |
| POST | `/products` | `{"name":"Yoga Mat","price":1200,"category":"fitness","stock":10}` |
| GET | `/cart` | Returns items and totals. |
| POST | `/cart` | `{"productId":"1","quantity":1}` |
| PATCH | `/cart/items/1` | `{"quantity":2}` |
| DELETE | `/cart/items/1` | Removes the item. Send another POST to the cart before testing checkout. |
| GET | `/orders` | Lists orders for the demo cart. |
| POST | `/orders` | `{"delivery":{"name":"Demo User","phone":"03000000000","address":"House 12","city":"Islamabad"},"paymentMethod":"COD"}` |

Repeat the matching GET after each POST to see the saved record. Create the example category before the example product. Put at least one item in the cart before posting an order, then check that the order appears and the cart is empty.

To test the browser flow, create a demo account, add a product, edit its quantity, enter delivery details, review the order, and confirm it. The confirmation displays the new order ID.
