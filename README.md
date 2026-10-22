# NovaCart - MERN Stack E-Commerce Platform

A complete, beginner-friendly E-Commerce website built on the **MERN** (MongoDB, Express.js, React.js, Node.js) technology stack with JWT authentication and role-based permissions.

---

## 1. Technology Stack

- **Frontend:** React.js, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Node.js, Express.js REST API
- **Database:** MongoDB with BSON ObjectIds, Collections (Users, Products, Orders)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing
- **Testing:** Node.js Test Runner (`node:test`) & Playwright browser verification

---

## 2. Project Structure

```
├── server.ts                   # Main Express server entry point mounting Vite middleware
├── server/
│   ├── config/
│   │   └── db.ts               # MongoDB collections, schema types, and initial data seeding
│   ├── controllers/
│   │   ├── userController.ts   # Registration, login, JWT issuance, profile
│   │   ├── productController.ts# Product listing, search, category filter, admin CRUD
│   │   ├── orderController.ts  # Server-side pricing calculation, order creation, order history
│   │   └── adminController.ts  # Administrative overview metrics & fulfillment
│   ├── middleware/
│   │   ├── auth.ts             # JWT protect middleware and admin role authorization
│   │   └── errorHandler.ts     # 404 handler and central JSON error formatting
│   ├── routes/
│   │   ├── userRoutes.ts       # /api/users routes
│   │   ├── productRoutes.ts    # /api/products routes
│   │   ├── orderRoutes.ts      # /api/orders routes
│   │   └── adminRoutes.ts      # /api/admin routes
│   └── utils/
│       ├── jwt.ts              # Token sign and verify
│       └── auth.test.ts        # Unit tests for authentication logic
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Brand header, category navigation, cart badge, user menu
│   │   ├── Footer.tsx          # Store footer and MERN architecture links
│   │   ├── ProductCard.tsx     # Reusable card with stock status & quick-add
│   │   ├── AdminProductModal.tsx # Add/edit product modal for administrators
│   │   ├── OrderConfirmationModal.tsx # Order success receipt modal
│   │   └── MernArchitectureModal.tsx # Interactive guide explaining the MERN stack
│   ├── context/
│   │   ├── AuthContext.tsx     # Authentication state, login, register, demo credentials
│   │   └── CartContext.tsx     # Shopping cart state, quantity controls, persistence
│   ├── services/
│   │   └── api.ts              # REST API client using fetch and Bearer JWT headers
│   ├── utils/
│   │   ├── pricing.ts          # Pure logic for subtotal, shipping, discounts, and taxes
│   │   └── pricing.test.ts     # Automated unit tests for cart and pricing logic
│   ├── views/
│   │   ├── HomeView.tsx        # Hero banner, category pills, featured products
│   │   ├── ProductsView.tsx    # Filterable catalog with search, price range, and sorting
│   │   ├── ProductDetailsView.tsx # Deep product specs, image view, quantity stepper
│   │   ├── CartView.tsx        # Shopping cart, promo codes, delivery address, checkout
│   │   ├── MyOrdersView.tsx    # Past orders, delivery tracking, items breakdown
│   │   ├── AdminDashboardView.tsx # Sales metrics, inventory CRUD, order status updates
│   │   └── AuthView.tsx        # Tabbed login/registration with 1-click demo buttons
│   ├── App.tsx                 # Root layout and client-side view routing
│   ├── main.tsx                # React DOM entry point
│   └── index.css               # Global Tailwind CSS imports
├── index.html                  # HTML entry point with meta tags
├── package.json                # Dependencies and project scripts
├── tsconfig.json               # TypeScript configuration
└── .env.example                # Example environment variables
```

---

## 3. Features Implemented

### User Features
- **User Authentication:** Create account, secure login, password hashed with `bcrypt`, JWT stored securely in `localStorage`.
- **Product Browsing:** View all catalog products with high-resolution imagery and ratings.
- **Search & Filters:** Search by product name/description, filter by category, filter by price range, filter in-stock only.
- **Sorting:** Sort by Newest, Price (Low to High), Price (High to Low), or Customer Rating.
- **Product Details:** Complete specifications, stock indicator, quantity picker, reviews count.
- **Shopping Cart:** Add products, update quantities, remove line items, apply promotional discount codes (e.g. `MERN10`, `SAVE20`).
- **Secure Server-Side Checkout:** Order prices and totals are verified and calculated on the server rather than trusting client inputs.
- **Order Placement:** Address form, payment selection, stock decrement, order confirmation modal.
- **My Orders:** View order history with live status badges (`Pending`, `Processing`, `Shipped`, `Delivered`).

### Admin Features
- **Role-Based Access Control:** Verified via `protect` and `admin` Express middleware.
- **Inventory Management:** Add new products, edit price/stock/details, delete items from MongoDB.
- **Order Fulfillment:** View all customer orders and update status (`Pending` -> `Shipped` -> `Delivered`).
- **Dashboard Metrics:** Real-time revenue calculation, total orders count, inventory stats.

---

## 4. Local Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/novacart-mern.git
   cd novacart-mern
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your `PORT=3000` and `JWT_SECRET`.

4. **Run unit tests:**
   ```bash
   npx tsx --test src/utils/pricing.test.ts
   npx tsx --test server/utils/auth.test.ts
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## 5. Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Customer** | `demo@example.com` | `user123` |
| **Administrator** | `admin@novacart.com` | `admin123` |

You can also use the 1-click test login buttons in the login screen or navigation bar.
