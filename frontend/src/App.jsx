import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminRoute, OwnerRoute, TenantRoute } from './components/RoleRoutes';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminMaintenance from './pages/AdminMaintenance';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-100">
            <Navbar />
            <main className="flex-1 w-full py-8">
              <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout/:id" element={<Checkout />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                </Route>

                {/* Tenant Routes */}
                <Route element={<TenantRoute />}>
                  {/* Add tenant-specific pages here */}
                </Route>

                {/* Owner Routes */}
                <Route element={<OwnerRoute />}>
                  {/* Add owner-specific pages here */}
                </Route>

                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/maintenance" element={<AdminMaintenance />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </ErrorBoundary>
            </main>
          
            {/* Footer */}
            <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-slate-500">
              <p>&copy; 2026 RentEase. All rights reserved.</p>
            </footer>
          
            <Toaster position="top-right" />
          </div>
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;

