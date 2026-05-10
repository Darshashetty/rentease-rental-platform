import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Loader2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/ProductCard';
import RecentlyViewed from '../components/RecentlyViewed';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(categoryParam || 'All');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('price_asc');
  const [page, setPage] = useState(1);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, availability, sortBy]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          search: search || undefined,
          category: category === 'All' ? undefined : category,
          availability: availability === 'all' ? undefined : availability,
          sort: sortBy,
          limit: 8,
          page: page,
        };
        const { data } = await api.get('/products', { params });
        setProducts(data?.data || []);
        setPagination(data?.meta || null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(() => {
      void fetchProducts();
    }, 500);
    return () => clearTimeout(debounce);
  }, [search, category, availability, sortBy, page]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) {
        setWishlistIds([]);
        return;
      }
      try {
        const { data } = await api.get('/wishlist');
        const ids = (data?.data || []).map((item) => item._id);
        setWishlistIds(ids);
      } catch {
        setWishlistIds([]);
      }
    };

    void fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (productId, currentlyInWishlist) => {
    if (!isAuthenticated) {
      toast.error('Please log in to use wishlist');
      return;
    }

    try {
      if (currentlyInWishlist) {
        await api.delete(`/wishlist/${productId}`);
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${productId}`);
        setWishlistIds((prev) => [...prev, productId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Our Catalog</h1>
        <p className="text-slate-500">Find the perfect items for your space</p>
      </div>

      {/* Filters Section */}
      <div className="space-y-4 mb-8">
        {/* Search and main filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              className="border border-slate-200 rounded-xl py-3 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Furniture">Furniture</option>
              <option value="Appliances">Appliances</option>
            </select>
            
            <select 
              className="border border-slate-200 rounded-xl py-3 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="all">Availability</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Sort and results */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{pagination?.total ?? products.length}</span> products found
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select 
              className="border border-slate-200 rounded-lg py-2 px-3 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <RecentlyViewed />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products && products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              canWishlist={isAuthenticated}
              inWishlist={wishlistIds.includes(product._id)}
              onToggleWishlist={toggleWishlist}
            />
          ))
        ) : null}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && products && products.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95"
          >
            Previous
          </button>
          
          <div className="flex gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 px-2">
            {Array.from({ length: pagination.pages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx + 1)}
                className={`w-10 h-10 flex-shrink-0 rounded-xl font-medium transition-all active:scale-95 ${
                  page === idx + 1 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95"
          >
            Next
          </button>
        </div>
      )}
      
      {!products || products.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 mt-8">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No products found</h3>
          <p className="text-slate-500 mb-4">Try adjusting your filters or search query.</p>
          <button 
            onClick={() => {
              setSearch('');
              setCategory('All');
              setAvailability('all');
              setSortBy('price_asc');
            }}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

// Local package icon for empty state
const Package = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
)

export default ProductList;
