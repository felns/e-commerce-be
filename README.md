# E‑Commerce Backend API

This project implements a full‑featured backend for an e‑commerce web
application. It is designed to support the screens visible in the
provided Figma designs, including product listings, product detail pages,
shopping cart, checkout flow, user authentication and profile editing,
admin dashboards and contact forms. The API is built with Node.js,
Express and MongoDB (via Mongoose) and returns JSON responses.

## Features

### User Management

- **Register** and **login** users with hashed passwords.
- **JWT‑based authentication** and authorization middleware to protect routes.
- User **profile retrieval** and **update** endpoints.
- **Admin user management** (list, view, update and delete users).

### Product Management

- CRUD endpoints for **products**, including support for categories,
  variants (colors, sizes) and flash sale flags.
- Products store **reviews** separately; users can add one review per
  product which updates its average rating.
- Ability to filter products by **category**, **keyword** or **flash sale**
  through query parameters.
- **Admin‑only** routes for creating, updating and deleting products.

### Categories

- CRUD endpoints for product **categories**. Categories group products on
  the home page and allow filtering.
- Only administrators can create, update or delete categories; anyone can
  list them.

### Shopping Cart

- Each authenticated user has a persistent **cart** document.
- Endpoints to **add**, **update** and **remove** items, as well as
  **clear** the cart or fetch the current cart contents.

### Orders

- Create orders from the user's cart, capturing shipping address,
  payment method and order items.
- Retrieve all orders for the authenticated user or, for admins, all
  orders in the system.
- View a single order by ID (limited to the owner or an admin).
- Admins can update the **payment** and **delivery** status of orders.

### Reviews

- Authenticated users can **add reviews** to products (one review per
  product). The product's average rating and review count are updated.
- **List reviews** for a product and **delete** a review (only the
  author or an admin can delete a review).

### Contact Messages

- Public endpoint to **send contact messages** from the website.
- Admin‑only endpoint to **view all messages**.

### Authentication & Authorization

- Endpoints use JWT tokens via the `Authorization` header (`Bearer <token>`).
- Middleware functions `protect` (authenticate) and `admin` (authorize admin)
  secure sensitive routes.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later)
- [MongoDB](https://www.mongodb.com/) (local installation or hosted service)

### Setup

1. Clone or download this repository.
2. Navigate to the project directory:

   ```bash
   cd backend_complete
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root with at least the following:

   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/mydatabase?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000` by default.

## API Endpoints

All endpoints return JSON and may require authentication. Paths are prefixed
according to their resource:

### Users (`/api/users`)

| Method | Endpoint                    | Description                                         | Auth        |
| ------ | --------------------------- | --------------------------------------------------- | ----------- |
| POST   | `/register`                 | Register a new user                                 | None        |
| POST   | `/login`                    | Authenticate a user and return a JWT token          | None        |
| GET    | `/profile`                  | Get the authenticated user's profile                | User        |
| PUT    | `/profile`                  | Update the authenticated user's profile             | User        |
| GET    | `/`                         | List all users                                      | Admin       |
| GET    | `/:id`                      | Get a user by ID                                    | Admin       |
| PUT    | `/:id`                      | Update a user by ID                                 | Admin       |
| DELETE | `/:id`                      | Delete a user by ID                                 | Admin       |

### Products (`/api/products`)

| Method | Endpoint              | Description                                                       | Auth        |
| ------ | --------------------- | ----------------------------------------------------------------- | ----------- |
| GET    | `/`                   | List products, with optional `category`, `keyword` or `flashSale` | None        |
| GET    | `/:id`                | Get a product by ID                                               | None        |
| POST   | `/`                   | Create a new product                                              | Admin       |
| PUT    | `/:id`                | Update an existing product                                        | Admin       |
| DELETE | `/:id`                | Delete a product                                                  | Admin       |
| POST   | `/:id/reviews`        | Add a review to a product                                         | User        |

### Categories (`/api/categories`)

| Method | Endpoint        | Description                       | Auth  |
| ------ | --------------- | --------------------------------- | ----- |
| GET    | `/`             | List all categories               | None  |
| POST   | `/`             | Create a new category             | Admin |
| PUT    | `/:id`          | Update a category                 | Admin |
| DELETE | `/:id`          | Delete a category                 | Admin |

### Cart (`/api/cart`)

| Method | Endpoint    | Description                            | Auth |
| ------ | ---------- | -------------------------------------- | ---- |
| GET    | `/`         | Get the authenticated user's cart      | User |
| POST   | `/add`      | Add an item to the cart                | User |
| PUT    | `/update`   | Update the quantity of a cart item     | User |
| DELETE | `/remove`   | Remove an item from the cart           | User |
| DELETE | `/clear`    | Clear the cart                         | User |

### Orders (`/api/orders`)

| Method | Endpoint      | Description                                      | Auth       |
| ------ | ------------- | ------------------------------------------------ | ---------- |
| POST   | `/`           | Create an order from the cart                    | User       |
| GET    | `/mine`       | Get the authenticated user's orders             | User       |
| GET    | `/`           | List all orders                                 | Admin      |
| GET    | `/:id`        | Get an order by ID (owner or admin)             | User/Admin |
| PUT    | `/:id`        | Update order status (payment/delivery)          | Admin      |

### Reviews (`/api/reviews`)

| Method | Endpoint          | Description                                       | Auth       |
| ------ | ----------------- | ------------------------------------------------- | ---------- |
| GET    | `/:productId`     | List reviews for a specific product               | None       |
| DELETE | `/:id`            | Delete a review (author or admin)                 | User/Admin |

### Contact (`/api/contact`)

| Method | Endpoint | Description                        | Auth  |
| ------ | -------- | ---------------------------------- | ----- |
| POST   | `/`      | Send a contact message             | None  |
| GET    | `/`      | List all contact messages          | Admin |

## Error Handling

All unhandled errors are caught by a global error handler and result in a
`500 Internal Server Error` response with a `message` field. Validation
and authentication errors return appropriate status codes (400–401–403).

## Development

For iterative development, you can run the server with `npm run dev` to
use `nodemon`, which restarts the server on file changes.

## Notes

- The API expects JSON request bodies. Make sure to set
  `Content-Type: application/json` in your requests.
- Passwords are stored securely hashed using bcrypt. Never store plain text
  passwords.
- The frontend should store and include the JWT token in the
  `Authorization` header when accessing protected endpoints.
