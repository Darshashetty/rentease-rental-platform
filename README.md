# RentEase – Full Stack Rental Management Platform

![MERN](https://img.shields.io/badge/Stack-MERN-2563eb)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-0ea5e9)
![Backend](https://img.shields.io/badge/Backend-Node%20%2B%20Express-16a34a)
![Database](https://img.shields.io/badge/Database-MongoDB-15803d)

A production-ready MERN rental platform with JWT authentication, role-based access control, and modern UI design. Features secure multi-tenant workflows, admin dashboards, product management, order processing, and email notifications. Built to demonstrate full-stack development practices including protected routes, server-side pagination, file uploads, and cloud deployment.

---

## 🌐 Live Deployment

- **Frontend:** [https://rentease-rental-platform-black.vercel.app](https://rentease-rental-platform-black.vercel.app)
- **Backend API:** [https://rentease-rental-platform.onrender.com](https://rentease-rental-platform.onrender.com)
- **Repository:** [GitHub](https://github.com/Darshashetty/rentease-rental-platform)

---

## � What This Project Demonstrates

- **Full-Stack Development:** Complete MERN application from frontend UI to backend API and database.
- **Authentication & Authorization:** JWT-based session management with secure password hashing and role-based route protection.
- **Multi-Tenant Architecture:** Separate user roles (tenant, owner, admin) with tailored dashboards and permissions.
- **Database Design:** MongoDB schema modeling for users, products, orders, and maintenance requests with proper indexing.
- **RESTful API Design:** Structured Express endpoints with error handling, middleware composition, and CORS configuration.
- **State Management:** React Context API for centralized auth state and Axios instance management.
- **UI/UX Design:** Responsive Tailwind CSS layout with layered visual hierarchy, mobile-first approach.
- **Production Deployment:** Vercel frontend, Render backend, MongoDB Atlas cloud database with environment-based configuration.
- **File Handling:** Multer for product image uploads with static file serving and validation.
- **Server-Side Pagination:** Efficient data retrieval with limit/offset pagination and sorting.
- **Real-Time Feedback:** Toast notifications and form validation for seamless user experience.

---

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

### Product Listing
![Product Listing](screenshots/products.png)

### Checkout / Orders
![Checkout](screenshots/checkout.png)

### Mobile Responsive View
![Mobile View](screenshots/mobile-view.png)

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
# Local Development
MONGO_URI=mongodb://127.0.0.1:27017/rentease
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development

# Production (MongoDB Atlas)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rentease?appName=Cluster0

# Email Configuration (optional, console fallback if not set)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

### Frontend (`frontend/.env`)
```env
# Local Development
VITE_API_URL=http://localhost:5000/api

# Production
# VITE_API_URL=https://rentease-rental-platform.onrender.com/api
```

**Note:** `.env` files are git-ignored for security. Configure your own values based on `.env.example` files.

---

## 🔌 API Features Overview

- **Centralized Axios Handling:** All HTTP requests use a globally configured Axios instance that intercepts requests to inject JWT Bearer tokens automatically.
- **Protected APIs:** Sensitive backend endpoints use custom middleware to verify token signatures.
- **Pagination Queries:** The product search endpoint utilizes MongoDB `skip()` and `limit()` combined with Regex for efficient querying.
- **Upload Handling:** The image endpoint intercepts multipart-form data using Multer, sanitizes filenames, and stores them in the static `uploads/` directory.

---

## 🌍 Deployment Architecture

- **Frontend:** Deployed on Vercel with automatic builds from GitHub and environment-based configuration.
- **Backend:** Deployed on Render with Node.js runtime and persistent environment variables.
- **Database:** MongoDB Atlas cloud instance with network access configuration and backups.
- **CORS Configuration:** Allows requests from deployed frontend and local development ports.

---

## 🔑 Access Notes

*Access details are available upon request.*

---

## 🔜 Future Improvements

- Payment gateway integration (e.g., Stripe)
- Cloud image storage migration
- Interactive booking calendar
- Analytics dashboard visualization