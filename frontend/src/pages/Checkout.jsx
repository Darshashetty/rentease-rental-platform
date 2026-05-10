import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext, api } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [tenure, setTenure] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        if (data.rentalTenureOptions?.length > 0) {
          setTenure(data.rentalTenureOptions[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!tenure) {
      toast.error('Please select rental tenure');
      return;
    }
    
    if (!deliveryDate) {
      toast.error('Please select delivery date');
      return;
    }

    const selectedDate = new Date(deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Delivery date cannot be in the past');
      return;
    }
    
    if (!address || !address.trim()) {
      toast.error('Please enter a valid delivery address');
      return;
    }

    if (address.trim().length < 10) {
      toast.error('Please enter a complete address (at least 10 characters)');
      return;
    }

    setSubmitting(true);
    try {
      const totalCost = (product.monthlyRent * tenure) + product.securityDeposit;

      const response = await api.post('/orders', {
        productId: product._id,
        rentalDuration: tenure,
        totalCost,
        deliveryDate,
        address: address.trim()
      });

      if (response.status === 201) {
        toast.success('Order placed successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600"/></div>;
  if (!product) return <div>Product not found</div>;

  const totalCost = (product.monthlyRent * tenure) + product.securityDeposit;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Checkout</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Order Summary</h2>
          <div className="flex gap-4 mb-6">
            <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
            <div>
              <h3 className="font-bold text-slate-800">{product.name}</h3>
              <p className="text-slate-500 text-sm">{product.category}</p>
              <p className="text-blue-600 font-bold mt-2">₹{product.monthlyRent}/mo</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex justify-between text-slate-600">
              <span>Monthly Rent (x{tenure} months)</span>
              <span>₹{product.monthlyRent * tenure}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Security Deposit (Refundable)</span>
              <span>₹{product.securityDeposit}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-slate-800 pt-3 border-t border-slate-100">
              <span>Total Upfront</span>
              <span>₹{totalCost || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Delivery Details</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rental Tenure (Months)</label>
              <select 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                required
              >
                {product?.rentalTenureOptions && product?.rentalTenureOptions?.length > 0 ? (
                  product?.rentalTenureOptions?.filter(option => option && option > 0)?.map(option => (
                    <option key={option} value={option}>{option} Months</option>
                  ))
                ) : (
                  <option value="">No tenure options available</option>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Address</label>
              <textarea 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete address"
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-md transition-all disabled:opacity-70"
            >
              {submitting ? 'Processing...' : `Pay ₹${totalCost} & Place Order`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
