# 🛒 Scatch - Ecommerce Platform

**Scatch** is a modern, full-stack ecommerce platform built with a focus on user-friendly design, advanced analytics, secure transactions, and seller dashboard functionality. Inspired by platforms like Flipkart and Amazon, it offers a clean UI, scalable backend, and powerful tools for both users and sellers.

---

## 🔧 Features

### 🧑‍💼 Seller Features
- Add, update, and delete products
- View sales analysis graphs:
  - Sales Over Time
  - Total Revenue
  - Sold Products
  - Stock Items
- Edit profile details (with inline form)
- Flash messages for real-time feedback
- Secure seller login and authentication using JWT

### 👥 User Features
- Browse products and view product details
- Place orders (server-validated price, atomic stock decrement)
- View order history and per-order details
- Wishlist with add/remove
- Make secure payments *(Razorpay integration coming)*

---

## 📊 Dashboards

The seller dashboard offers clean, interactive graphs built with **Recharts**, featuring:
- A consistent **blue-themed UI** with color contrasts for visual clarity
- Responsive and flexible layout using `flex`
- Clean, modern styling powered by Tailwind CSS

---

## 🛠️ Tech Stack

| Tech Stack  | Description                          |
|-------------|--------------------------------------|
| **Frontend** | React, React Router, Tailwind CSS     |
| **Backend**  | Node.js, Express.js                   |
| **Database** | MongoDB                               |
| **Auth**     | JWT, bcrypt                           |
| **Charts**   | Recharts                              |
| **Payments** | *(Coming soon)* Razorpay Integration  |

---

## 📁 Folder Structure (Simplified)

```
scatch-website/
├── client/           # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── vercel.json   # SPA rewrite for client-side routing
├── server/           # Express + Mongoose backend
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── scripts/      # seed + smoke suite
│   └── tests/
├── DEPLOYMENT.md     # live status + deployment guide
└── README.md
```

---

## 🚀 Getting Started

The project runs with **zero external services** — no MongoDB Atlas account, no
Cloudinary setup. When `MONGODB_URI` is empty the server starts an in-memory
MongoDB and seeds demo data automatically.

### 1. Clone the Repository
```bash
git clone https://github.com/atharva486/scatch-website.git
cd scatch-website
```

### 2. Set up the Server
```bash
cd server
npm install
cp .env.example .env     # optional: MONGODB_URI may stay empty for local dev
npm run dev              # http://localhost:3000
```

The server prints the demo credentials on startup. All demo accounts use the
password `Password123`:

| Role    | Email                          |
|---------|--------------------------------|
| Customer| `user@scatch.dev`              |
| Customer| `user2@scatch.dev`             |
| Seller  | `seller@scatch.dev`            |
| Seller  | `seller2@scatch.dev`           |

> Sellers and customers are separate account types. A seller account cannot log
> in at `/user/login` and vice versa. Use `/seller/login` for sellers.

### 3. Set up the Client
```bash
cd ../client
npm install
npm run dev              # http://localhost:5173
```

Open **http://localhost:5173** — not 3000, which is the API. In development
`VITE_API_URL` is left empty so the Vite dev server proxies `/api` to the
backend and the browser only ever talks to one origin, which keeps the auth
cookie first-party.

### 4. Verify the stack
```bash
cd server
npm test                # 32 tests: authorization, atomic stock, validation
./scripts/smoke.sh      # 47 end-to-end checks against the running server
cd ../client
npx eslint .            # lint
npx vite build          # production build
```

---

## 🚢 Deployment

**See [DEPLOYMENT.md](./DEPLOYMENT.md)** for the current live status, what is
blocking a working deployment, and the step-by-step fix.

In short: the frontend is on Vercel, the backend on Render, and the two things
that need doing are the Vercel SPA rewrite (so deep links work) and a Render
redeploy (so the backend runs the current code).

---
