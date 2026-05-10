import { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist');
      setWishlist(data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWishlist();
  }, []);

  const toggleWishlist = async (productId, currentlyInWishlist) => {
    try {
      if (currentlyInWishlist) {
        await api.delete(`/wishlist/${productId}`);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${productId}`);
        toast.success('Added to wishlist');
      }
      await fetchWishlist();
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Wishlist</h1>
        <p className="text-slate-500">Your saved favorites for later</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <Heart className="h-14 w-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Your wishlist is empty</h3>
          <p className="text-slate-500">Browse products and save your favorites here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              canWishlist
              inWishlist
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
