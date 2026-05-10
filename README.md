# RentEase – Full Stack Rental Management Platform

RentEase is a modern, responsive MERN-stack platform built for discovering, tracking, and renting out appliances and furniture. Designed with a clean architecture, it demonstrates a complete, real-world application workflow—from secure JWT authentication and admin dashboards to wishlist management, order processing, local image uploads, and automated email notifications.

---

## 🚀 Live Demo
- **Frontend URL:** [Deploy link placeholder]
- **Backend URL:** [Deploy link placeholder]

---

## ✨ Features

- **JWT Authentication:** Secure user sessions and password hashing using bcrypt.
- **Protected Routes:** Frontend protection with React Router.
- **Role-Based Admin Access:** Specialized dashboards for users vs. administrators.
- **Product Search & Filters:** Dynamic filtering by category and availability.
- **Debounced Search:** Highly optimized search input (500ms delay) to prevent API spam.
- **Server-Side Pagination:** Efficient MongoDB `.skip()` and `.limit()` queries for scalable browsing.
- **Wishlist/Favorites:** Users can toggle items to their personal wishlist.
- **Product Image Uploads:** Handled securely via Multer middleware.
- **Order Placement:** Complete checkout flow.
- **Order Status Tracking:** Admins manage transitions (Pending -> Approved -> Rented).
- **Nodemailer Email Notifications:** Automated HTML emails for order confirmations.
- **Responsive UI:** CSS Grids and Flexbox styled with Tailwind CSS.
- **Toast Notifications:** Clean UX feedback via `react-hot-toast`.

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
    │   ├── context/     # AuthContext and Axios global config
    │   ├── hooks/       # Custom React Hooks
    │   └── pages/       # Route-level views (Dashboard, ProductList)
    └── index.html
```

---

## 📸 Screenshots

### Home Page
![Home Page Placeholder](https://via.placeholder.com/800x400?text=Home+Page+Screenshot)

### Product Listing & Filters
![Product Listing Placeholder](https://via.placeholder.com/800x400?text=Product+Listing+Screenshot)

### User Wishlist
![Wishlist Placeholder](https://via.placeholder.com/800x400?text=Wishlist+Screenshot)

### Admin Dashboard
![Admin Dashboard Placeholder](https://via.placeholder.com/800x400?text=Admin+Dashboard+Screenshot)

### Mobile Responsive View
![Mobile View Placeholder](https://via.placeholder.com/400x600?text=Mobile+Responsive+View)

---

## 💻 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/rentease-rental-platform.git
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
- **Protected APIs:** Sensitive backend endpoints (like `/api/orders` or `/api/products/upload-image`) use a custom `protect` and `admin` middleware to verify token signatures.
- **Pagination Queries:** The product search endpoint utilizes MongoDB `skip()` and `limit()` combined with Regex for lightning-fast querying without loading the entire DB into memory.
- **Upload Handling:** The `upload-image` endpoint intercepts multipart-form data using Multer, sanitizes filenames, and stores them in the static `uploads/` directory.

---

## 🌍 Deployment

- **Frontend (Vercel):** Optimized for SPA routing with a `vercel.json` file to ensure URLs resolve correctly upon page refresh.
- **Backend (Render):** Configured to accept dynamic CORS requests relying on the `CLIENT_URL` environment variable.
- **Database:** Fully integrated with MongoDB Atlas cloud clusters.

---

## 💼 What This Project Demonstrates

- **Full-Stack Development:** Seamlessly integrating a modern React UI with a robust Node.js backend.
- **Authentication Systems:** Implementing industry-standard JWT protocols.
- **REST API Design:** Structuring clear, maintainable, and stateless HTTP endpoints.
- **Responsive UI Engineering:** Building mobile-first layouts and utilizing skeleton loaders/empty states.
- **Backend Architecture:** Separating concerns into Routes, Controllers, Middleware, and Utilities.
- **Real-World Workflows:** Handling real user interactions like dynamic searching, file uploads, and transactional email triggers.

---

## 🔑 Demo Credentials

**Admin Login**
- Email: `admin@example.com`
- Password: `admin123`

**Demo User Login**
- Email: `demo@example.com`
- Password: `demo123`

---

## 🔜 Future Improvements

- Payment gateway integration (e.g., Stripe)
- Cloud image storage migration
- Interactive booking calendar
- Analytics dashboard visualization