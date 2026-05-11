# RentEase – Full Stack Rental Management Platform

![MERN](https://img.shields.io/badge/Stack-MERN-2563eb)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-0ea5e9)
![Backend](https://img.shields.io/badge/Backend-Node%20%2B%20Express-16a34a)
![Database](https://img.shields.io/badge/Database-MongoDB-15803d)

RentEase is a polished MERN-stack rental platform featuring role-based authentication, responsive dashboards, and a modern layered UI design. Built with React, Vite, Tailwind CSS, Express, and MongoDB, it demonstrates production-quality practices including secure JWT authentication, server-side pagination, email notifications, and admin workflows.

---

## 🔗 Repository
- **GitHub:** [Darshashetty/rentease-rental-platform](https://github.com/Darshashetty/rentease-rental-platform)

---

## 🚀 Key Highlights

- **Responsive Dashboard Design** with tenant, owner, and admin role-based views
- **Layered Modern UI Styling** with professional depth and spacing harmony
- **JWT Authentication & Role-Based Access Control** for secure multi-tenant workflows
- **Server-Side Pagination & Debounced Search** for efficient data retrieval
- **Product Image Uploads** with Multer file handling
- **Email Notifications** via Nodemailer with graceful fallback
- **Admin Management Panel** for orders, products, and maintenance requests
- **Wishlist & Recently Viewed** features for personalized UX

---

## ✨ Features

- **JWT Authentication:** Secure sessions with bcrypt password hashing and 30-day token expiry.
- **Protected Routes:** Frontend and backend role guards for multi-tenant access control.
- **Admin Dashboard:** Order management, maintenance request handling, and product administration.
- **Responsive Dashboards:** Tenant dashboard for rentals and maintenance, admin view for operations.
- **Product Search & Filters:** Dynamic filtering by category, price, availability with server-side pagination.
- **Debounced Search:** Optimized search input to reduce database queries during typing.
- **Wishlist System:** Save and manage favorite items with persistent backend storage.
- **Recently Viewed:** Client-side tracking of browsed products for quick navigation.
- **Order Lifecycle:** Complete flow from placement through approval, rental, extension, and return.
- **Image Uploads:** Admin product image handling via Multer with static file serving.
- **Email Notifications:** Automated emails for account creation, order updates, and password resets (with console fallback).
- **Maintenance Requests:** Users request maintenance; admins track and update status.
- **Rental Extensions:** Tenants request extension with cost calculation; admins approve/reject.
- **Layered UI Design:** Modern depth styling with neutral color palette and professional spacing.
- **Mobile Responsive:** Optimized layouts for desktop, tablet, and mobile viewports.
- **Toast Notifications:** Real-time feedback for user actions with success/error states.

---

## 🛠 Tech Stack

**Frontend**
- React.js
- Vite
- Tailwind CSS
- Axios (Centralized Instance)
- React Router

**Backend**
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Multer (File Handling)
- Nodemailer (SMTP Emails)

---

## 📂 Folder Structure

```text
rentease-rental-platform/
├── backend/
│   ├── config/          # DB connection logic
│   ├── middleware/      # Auth, Multer, Error handlers
│   ├── models/          # Mongoose schemas (User, Product, Order)
│   ├── routes/          # Express API endpoints
│   ├── utils/           # Nodemailer and helper scripts
│   ├── uploads/         # Locally stored images
│   └── index.js         # Entry point
└── frontend/
    ├── src/
      │   ├── components/  # Reusable UI (Cards, Loaders, Navbar)
      │   │   └── RecentlyViewed.jsx # lightweight recently viewed UI
    │   ├── context/     # AuthContext and Axios global config
    │   ├── hooks/       # Custom React Hooks
    │   └── pages/       # Route-level views (Dashboard, ProductList)
    └── index.html
```

---

## 📸 Screenshots

### Home Page
![Home Page](screenshots/homepage.png)

### Product Listing & Filters
![Product Listing](screenshots/product-listing-filters.png)

### User Wishlist
![Wishlist](screenshots/wishlist.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### Checkout / Orders Page
![Checkout / Orders](screenshots/checkout-orders.png)

### Mobile Responsive View
![Mobile View](screenshots/mobile-responsive.png)

---

## 💻 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Darshashetty/rentease-rental-platform.git
   cd rentease-rental-platform
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables:**
   - Create a `.env` file in the `/backend` folder.
   - Create a `.env` file in the `/frontend` folder.
   *(See the Environment Variables section below for configuration)*

5. **Run Backend (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```

6. **Run Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/rentease?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=RentEase
```

---

## 🔌 API Features Overview

- **Centralized Axios Handling:** All HTTP requests use a globally configured Axios instance that intercepts requests to inject JWT Bearer tokens automatically.
- **Protected APIs:** Sensitive backend endpoints use custom middleware to verify token signatures.
- **Pagination Queries:** The product search endpoint utilizes MongoDB `skip()` and `limit()` combined with Regex for efficient querying.
- **Upload Handling:** The image endpoint intercepts multipart-form data using Multer, sanitizes filenames, and stores them in the static `uploads/` directory.

---

## 🌍 Deployment

- **Frontend:** Configure any SPA host that supports client-side routing.
- **Backend:** Deploy to any Node.js host that supports environment variables and CORS configuration.
- **Database:** Works with MongoDB Atlas or a local MongoDB instance.

---

## 💼 What This Project Demonstrates

- **Full-Stack MERN Architecture:** Integration of React, Node.js, Express, and MongoDB in a production-grade workflow.
- **Authentication & Security:** JWT implementation, password hashing, protected endpoints, and role-based access control.
- **RESTful API Design:** Stateless endpoints with proper separation of concerns via routes, middleware, and models.
- **Modern Frontend Engineering:** React hooks, centralized state management via Context API, responsive Tailwind CSS design.
- **Database Optimization:** Server-side pagination, indexed queries, and Mongoose schema design for scalability.
- **File Handling & Uploads:** Multer integration for image uploads with static file serving and security validation.
- **Email Integration:** Nodemailer setup with SMTP fallback for reliable transactional communications.
- **UI/UX Polish:** Layered visual design with professional spacing, responsive layouts, and real-time feedback systems.
- **Admin Workflows:** Order and maintenance management interfaces demonstrating operational dashboards.
- **Error Handling & Logging:** Centralized error middleware and debugging strategies.

---

## 🔑 Access Notes

*Access details are available upon request.*

---

## 🔜 Future Improvements

- Payment gateway integration (e.g., Stripe)
- Cloud image storage migration
- Interactive booking calendar
- Analytics dashboard visualization