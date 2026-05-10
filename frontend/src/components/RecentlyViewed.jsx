import { Link } from 'react-router-dom';
import useRecentlyViewed from '../hooks/useRecentlyViewed';

const RecentlyViewed = () => {
  const { items } = useRecentlyViewed();
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Recently Viewed</h2>
        <p className="text-sm text-slate-500">Quick access to items you looked at</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p._id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200 flex">
            <Link to={`/products/${p._id}`} className="flex gap-4 p-3 items-center w-full">
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-50">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2">{p.name}</h3>
                <div className="text-xs text-slate-500 mt-1">Rs {p.monthlyRent}/mo</div>
                <div className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${p.availability ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {p.availability ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
