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

### 👥 User Features (Planned / Partially Implemented)
- Browse products
- Place orders
- View order history
- Add to wishlist/cart
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
scatch/
├── client/        # React frontend
├── server/        # Node + Express backend
├── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/atharva486/scatch-website.git
```

### 2. Set up the Server
```bash
cd Scatch/server
npm install
npm start
```

### 3. Set up the Client
```bash
cd ../client
npm install
npm start
```

### 4. Visit in Browser
```
http://localhost:3000
```

---

## 📂 How to Open the Project

After cloning the project, open it in your preferred code editor (e.g., VS Code):

```bash
code Scatch
```

Make sure MongoDB is running locally or configured in `.env`. Then run both server and client using instructions above.

---
