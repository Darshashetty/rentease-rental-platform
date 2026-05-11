import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, Home, LogOut, User as UserIcon, LayoutDashboard, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [{ label: 'Browse Listings', href: '/products', show: true }];

  const userLinks = [
    { label: 'Dashboard', href: '/dashboard', show: true, icon: LayoutDashboard },
    { label: 'Wishlist', href: '/wishlist', show: true, icon: Heart },
    { label: 'Admin Panel', href: '/admin/dashboard', show: isAdmin, icon: Home },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex flex-none items-center gap-2 whitespace-nowrap hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <span className="whitespace-nowrap text-xl font-bold text-slate-900 leading-none">RentEase</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-4 lg:gap-5">
            <div className="flex items-center gap-4 lg:gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="inline-flex h-10 items-center whitespace-nowrap text-sm font-medium leading-none text-slate-700 transition-colors hover:text-blue-600"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-4 lg:gap-5">
                  {userLinks.map((link) => link.show && (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="inline-flex h-10 items-center gap-1 whitespace-nowrap text-sm font-medium leading-none text-slate-700 transition-colors hover:text-blue-600"
                    >
                      <link.icon size={16} />
                      {link.label}
                    </Link>
                  ))}
                </div>
                
                <div className="ml-2 flex h-10 items-center gap-3 border-l border-slate-200 pl-4">
                  <div className="flex items-center gap-2">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <UserIcon size={18} className="text-blue-600" />
                      </div>
                    )}
                    <div className="leading-tight">
                      <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                      <p className="text-xs capitalize text-slate-500">{user?.role}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="ml-2 flex h-10 items-center gap-3 border-l border-slate-200 pl-4">
                <Link
                  to="/login"
                  className="inline-flex h-10 items-center whitespace-nowrap text-sm font-medium leading-none text-slate-700 transition-colors hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium leading-none text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <div className="border-t border-slate-200 my-2 pt-2">
                  {userLinks.map((link) => link.show && (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
                      onClick={() => setIsOpen(false)}
                    >
                      <link.icon size={18} />
                      {link.label}
                    </Link>
                  ))}
                </div>
                
                <div className="border-t border-slate-200 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-slate-200 pt-2 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
