import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ShieldAlert, Truck, CheckCircle2, ChevronRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!isAuthenticated || !id) {
        setInWishlist(false);
        return;
      }
      try {
        const { data } = await api.get(`/wishlist/${id}/status`);
        setInWishlist(Boolean(data?.inWishlist));
      } catch {
        setInWishlist(false);
      }
    };
    void fetchStatus();
  }, [id, isAuthenticated]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to use wishlist');
      return;
    }
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${id}`);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${id}`);
        setInWishlist(true);
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

  if (!product) {
    return <div className="text-center py-20 text-xl text-slate-600">Product not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-slate-500 mb-8">
        <Link to="/products" className="hover:text-blue-600 transition-colors">Catalog</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-slate-800 font-medium">{product.name}</span>
      </nav>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="bg-slate-50 p-8 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-w-full h-auto rounded-2xl shadow-lg mix-blend-multiply"
            />
          </div>

          {/* Details Section */}
          <div className="p-8 lg:p-12 flex flex-col">
            <div className="mb-2 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {product.category}
              </span>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {product.subCategory}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">{product.name}</h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-8 border-b border-slate-100 pb-8">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Monthly Rent</p>
                <div className="flex items-end">
                  <span className="text-3xl font-extrabold text-blue-600">₹{product.monthlyRent}</span>
                  <span className="text-slate-500 ml-1 mb-1">/mo</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Security Deposit</p>
                <div className="flex items-end">
                  <span className="text-3xl font-extrabold text-slate-800">₹{product.securityDeposit}</span>
                  <span className="text-slate-500 ml-1 mb-1">refundable</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Available Tenures</p>
                  <p className="text-sm text-slate-500">{product?.rentalTenureOptions?.join(', ') || ''} months</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-6 w-6 text-blue-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Free Delivery</p>
                  <p className="text-sm text-slate-500">Delivered within 3-5 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Free Maintenance</p>
                  <p className="text-sm text-slate-500">Regular servicing included in rent</p>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={toggleWishlist}
                className={`w-full mb-3 py-3 border rounded-xl font-semibold transition flex items-center justify-center gap-2 ${inWishlist ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
              <button 
                onClick={() => navigate(`/checkout/${product._id}`)}
                disabled={!product.availability}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {product.availability ? 'Rent Now' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
