# ShopEase — E-commerce Web Application

ShopEase is a full-stack e-commerce lab project built with HTML, Bootstrap, JavaScript, and Node.js. It provides a shopping flow from account registration to order confirmation, using REST APIs and local JSON files for persistence without a database.

## Features

- Account registration and login using email or phone
- Product catalog with search
- Add products to a personal cart
- Update quantities and remove cart items
- Checkout with a saved delivery draft
- Order review and cash-on-delivery order placement
- Persistent user, cart, stock, and order data
- Password hashing and token-based authentication

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | HTML5, CSS3, Bootstrap 5, Bootstrap Icons, JavaScript |
| Backend | Node.js built-in HTTP server |
| Server storage | Local JSON file |
| Browser storage | localStorage for sessions and checkout drafts |
| Testing | Node.js built-in test runner |

No third-party backend packages or database setup are required. Bootstrap, icons, and product images load from external services and require an internet connection.

## Getting Started

### Prerequisites

- Node.js 22 or newer
- npm, included with Node.js

### Run Locally

Clone this repository, open a terminal in the project directory, and run:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Use the Node.js server to access the application. Opening the HTML files directly or using a separate Live Server will not provide the API routes.

For development with automatic server restarts:

```bash
npm run dev
```

If port 3000 is already occupied, stop the existing server or choose another port. On macOS/Linux:

```bash
PORT=3001 npm start
```

Restart the server after backend changes when using `npm start`, then refresh the browser.

## Project Structure

```text
Ecommerce/
├── assets/
│   └── js/
│       └── app.js             # Frontend API integration and browser state
├── src/
│   ├── controllers/
│   │   └── api.js             # Request handlers
│   ├── routes/
│   │   └── index.js           # API endpoint definitions
│   ├── services/
│   │   ├── auth.js            # Authentication and sessions
│   │   ├── shop.js            # Cart and order business logic
│   │   └── store.js           # JSON persistence and catalog seed
│   ├── utils/
│   │   └── http.js            # Validation and HTTP helpers
│   ├── app.js                 # HTTP routing and static file serving
│   └── server.js              # Server entry point
├── data/
│   └── store.json             # Generated at runtime; ignored by Git
├── tests/
│   └── api.test.js            # API integration tests
├── index.html
├── signup.html
├── login.html
├── cart.html
├── edit-cart.html
├── checkout.html
├── review-order.html
├── package.json
├── .gitignore
└── README.md
```

## Using the Application

1. Create an account or log in.
2. Browse the catalog and select **Add** on a product.
3. Open **Cart** to view items, adjust quantities, or remove products.
4. Use **Edit Cart** and select **Update & Save Cart** to save edited quantities.
5. Continue to checkout and enter delivery information.
6. Review the order and select **Confirm & Place Order**.
7. View the confirmation with the generated order ID.

## Data Persistence

The server creates `data/store.json` on first startup, including an initial catalog of eight products. Users, sessions, carts, stock, and orders remain available after a server restart. Set the optional `DATA_FILE` environment variable to use another storage file.

Browser localStorage holds:

| Key | Purpose |
| --- | --- |
| `shopease.session` | Authentication token, expiry, and public user profile |
| `shopease.checkout.<userId>` | Delivery draft and payment choice for the signed-in user |

Passwords are never saved in browser storage. The server stores salted password hashes and hashed session tokens. Checkout drafts are removed after successful order placement.

Runtime data is excluded from Git. A fresh clone starts with a new store; no test accounts or private user data need to be committed.

## API Reference

Base URL: `http://localhost:3000/api`

Send request bodies with `Content-Type: application/json`. Protected endpoints require the token returned by login:

```http
Authorization: Bearer <token>
```

Sessions expire after seven days. Logout revokes the current session.

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | Server health |
| POST | `/auth/register` | No | Register an account |
| POST | `/auth/login` | No | Log in using email or phone |
| GET | `/auth/me` | Yes | Get the current user |
| POST | `/auth/logout` | Yes | Revoke the current session |
| GET | `/products` | No | List products; optional `q` and `category` query parameters |
| GET | `/products/:id` | No | Get a product |
| GET | `/cart` | Yes | Get cart items and totals |
| POST | `/cart/items` | Yes | Add a product or increase its quantity |
| PATCH | `/cart/items/:id` | Yes | Replace an item's quantity |
| DELETE | `/cart/items/:id` | Yes | Remove an item |
| DELETE | `/cart` | Yes | Clear the cart |
| POST | `/orders` | Yes | Place an order from the current cart |
| GET | `/orders` | Yes | List the current user's orders |
| GET | `/orders/:id` | Yes | Get an order belonging to the current user |

For cart item endpoints, `:id` is the product ID.

### Example Request Bodies

**Register** — `POST /auth/register`

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "phone": "03000000000",
  "password": "example-password"
}
```

**Login** — `POST /auth/login`

```json
{
  "identifier": "demo@example.com",
  "password": "example-password"
}
```

The `identifier` can be an email address or phone number. The API also accepts `email` as an alternative field name.

**Add to cart** — `POST /cart/items`

```json
{
  "productId": "1",
  "quantity": 1
}
```

**Update quantity** — `PATCH /cart/items/1`

```json
{
  "quantity": 2
}
```

**Place an order** — `POST /orders`

```json
{
  "delivery": {
    "name": "Demo User",
    "phone": "03000000000",
    "address": "House 1, Example Street",
    "city": "Islamabad",
    "postal": "44000"
  },
  "paymentMethod": "COD"
}
```

The postal code is optional. Add an item to the cart before placing an order.

### Responses and Validation

Successful responses use `{ "data": ... }`. Errors use `{ "error": "message" }`.

- Passwords must contain 8–128 characters.
- Quantities must be integers from 1 to 99 and within available stock.
- Prices and totals use whole Pakistani rupees (PKR).
- Delivery costs Rs. 200 below Rs. 2,000 and is free from Rs. 2,000.
- The server calculates order totals, reduces stock, and clears the cart after checkout.
- Orders can only be viewed by their owner.

Common status codes: `200` success, `201` created, `400` invalid input, `401` authentication required, `404` resource not found, and `409` duplicate account or insufficient stock.

## Testing

Run the integration tests:

```bash
npm test
```

The tests use an isolated temporary storage file and check authentication, cart validation, order totals, stock updates, order ownership, logout, and persistence across server restarts. They do not modify the application's normal data file.

For a manual browser check, register an account, add a product, edit its quantity, enter checkout details, reload to confirm that the draft persists, and place an order. The confirmation should display an order ID and the cart count should reset to zero.

## Project Scope

This application is intended for local development and coursework. JSON storage supports a single server process per data file. Cash on delivery is implemented; online payment processing, password recovery, and shipment tracking are not implemented. The browser stores bearer tokens in localStorage, so production deployment would require additional security and storage considerations.
