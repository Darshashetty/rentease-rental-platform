import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, canWishlist, inWishlist, onToggleWishlist }) => {
  if (!product?._id) return null;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.image || '/placeholder.png'}
          alt={product.name || 'Product'}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide">
          {product.subCategory || product.category}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {canWishlist ? (
            <button
              onClick={() => onToggleWishlist?.(product._id, Boolean(inWishlist))}
              className={`p-2 rounded-full shadow-md transition ${inWishlist ? 'bg-rose-500 text-white' : 'bg-white text-slate-700 hover:bg-rose-50'}`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          ) : null}
          {product.availability ? (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              In Stock
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-4 flex-grow">
          <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
          <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{product.description}</p>

          <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex justify-between items-end">
              <span className="text-slate-500 text-xs font-medium">Rent</span>
              <div>
                <span className="text-xl font-extrabold text-blue-600">Rs {product.monthlyRent}</span>
                <span className="text-slate-500 text-xs">/mo</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200/60 mt-1">
              <span>Deposit</span>
              <span className="font-semibold text-slate-700">Rs {product.securityDeposit}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <Link to={`/products/${product._id}`} className="py-2.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors">
            View Details
          </Link>
          {product.availability ? (
            <Link to={`/checkout/${product._id}`} className="py-2.5 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-1">
              Rent Now <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button disabled className="py-2.5 text-center bg-slate-100 text-slate-400 rounded-xl font-semibold text-sm cursor-not-allowed">
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
