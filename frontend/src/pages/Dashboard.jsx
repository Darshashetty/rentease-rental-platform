import { useState, useEffect, useContext } from 'react';
import { Loader2, Wrench, Package, Calendar, MapPin, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext, api } from '../context/AuthContext';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [extensionOrder, setExtensionOrder] = useState('');
  const [extensionMonths, setExtensionMonths] = useState(3);

  useEffect(() => {
    // Only fetch if token is available
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersRes, maintRes] = await Promise.all([
          api.get('/orders/myorders'),
          api.get('/maintenance/myrequests')
        ]);
        const validOrders = ordersRes.data?.filter(order => order && order.productId && order.productId._id) || [];
        setOrders(validOrders);
        const validMaintenance = maintRes.data?.filter(req => req && req._id) || [];
        setMaintenanceRequests(validMaintenance);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedOrder) {
      toast.error('Please select a rental from the dropdown');
      return;
    }
    
    if (!issue.trim()) {
      toast.error('Please describe the issue');
      return;
    }
    
    try {
      const { data } = await api.post('/maintenance', { orderId: selectedOrder, issue });
      setMaintenanceRequests([...maintenanceRequests, data]);
      setIssue('');
      setSelectedOrder('');
      toast.success('Maintenance request submitted successfully');
    } catch (error) {
      console.error('Maintenance submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit maintenance request');
    }
  };

  const handleExtensionRequest = async (e) => {
    e.preventDefault();
    
    if (!extensionOrder) {
      toast.error('Please select a rental to extend');
      return;
    }
    
    if (!extensionMonths || extensionMonths < 1) {
      toast.error('Please select valid extension duration');
      return;
    }

    try {
      const order = orders.find(o => o._id === extensionOrder);
      
      if (!order) {
        toast.error('Order not found');
        return;
      }

      const extendedCost = order.productId.monthlyRent * extensionMonths;
      
      await api.post(`/orders/${extensionOrder}/extend`, {
        extendedMonths: extensionMonths,
        extendedCost
      });
      
      // Refetch orders to show updated extensions
      const ordersRes = await api.get('/orders/myorders');
      const validOrders = ordersRes.data?.filter(o => o && o.productId && o.productId._id) || [];
      setOrders(validOrders);
      
      setExtensionOrder('');
      setExtensionMonths(3);
      toast.success('Extension request submitted! Waiting for admin approval.');
    } catch (error) {
      console.error('Extension request error:', error);
      toast.error(error.response?.data?.message || 'Failed to request extension');
    }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600"/></div>;

  const maintenanceEligibleOrders = orders.filter(o => o && ['Rented'].includes(o.status));

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Dashboard</h1>
        <p className="text-slate-500">Welcome back, {user?.name || 'User'}!</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" /> Active Rentals
            </h2>
            
            {!orders || orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">You have no active rentals yet.</p>
                <a href="/products" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                  Browse Products
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders?.filter(order => order && order.productId && order.productId._id)?.map(order => (
                  <div key={order?._id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start">
                    <img src={order?.productId?.image || '/placeholder.png'} alt={order?.productId?.name || 'Unknown Product'} className="w-20 h-20 object-cover rounded-lg shrink-0" />
                    <div className="flex-grow w-full">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800">{order.productId?.name || 'Unknown Product'}</h3>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                          order.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          order.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Rented' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'Returned' ? 'bg-green-100 text-green-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {order.rentalDuration} Months</div>
                        <div className="flex items-center gap-1 text-blue-600 font-semibold">₹{order.totalCost}</div>
                        <div className="flex items-center gap-1 col-span-2"><MapPin className="h-4 w-4 shrink-0" /> <span className="truncate">{order.address}</span></div>
                      </div>
                      
                      {/* Display extensions if any */}
                      {order?.extensions && order.extensions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Extensions:</p>
                          <div className="space-y-1">
                            {order.extensions?.filter(ext => ext && ext._id)?.map(ext => (
                              <div key={ext._id} className="text-xs p-2 bg-slate-50 rounded border border-slate-100">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{ext.extendedMonths} months - ₹{ext.extendedCost}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    ext.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                    ext.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {ext.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-500" /> Request Maintenance
            </h2>
            <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Rental for Maintenance</label>
                {maintenanceEligibleOrders.length === 0 ? (
                  <select disabled className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-slate-50 text-slate-400 text-sm cursor-not-allowed">
                    <option>No eligible rentals available</option>
                  </select>
                ) : (
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm hover:border-slate-300 transition"
                    value={selectedOrder}
                    onChange={(e) => setSelectedOrder(e.target.value)}
                  >
                    <option value="">Choose a rental...</option>
                    {maintenanceEligibleOrders?.filter(order => order && order._id && order.productId && order.productId._id)?.map(order => (
                      <option key={order?._id} value={order?._id}>
                        {order?.productId?.name || 'Item'} (₹{order?.totalCost || 0})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Describe Issue</label>
                <textarea 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows="3"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="What's wrong?"
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={maintenanceEligibleOrders.length === 0}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" /> Rental Extensions
            </h2>
            
            {/* Active rentals eligible for extension */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Your Active Rentals</h3>
              {orders?.filter(o => o && o.status === 'Rented' && o.productId && o.productId._id)?.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">No active rentals available for extension</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {orders?.filter(o => o && o.status === 'Rented' && o.productId && o.productId._id)?.map(order => (
                    <div key={order._id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                      <div className="font-medium text-slate-800">{order.productId?.name || 'Item'}</div>
                      <div className="text-slate-500 text-xs">₹{order.productId?.monthlyRent}/month</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extension request form */}
            {orders?.filter(o => o && o.status === 'Rented' && o.productId && o.productId._id)?.length > 0 && (
              <form onSubmit={handleExtensionRequest} className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Rental to Extend</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    value={extensionOrder}
                    onChange={(e) => setExtensionOrder(e.target.value)}
                  >
                    <option value="">Choose a rental...</option>
                    {orders?.filter(o => o && o.status === 'Rented' && o.productId && o.productId._id)?.map(order => (
                      <option key={order._id} value={order._id}>
                        {order.productId?.name || 'Item'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Extend for {extensionMonths} Month(s)</label>
                  <input 
                    type="range"
                    min="1"
                    max="12"
                    value={extensionMonths}
                    onChange={(e) => setExtensionMonths(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-slate-500 mt-1 flex justify-between">
                    <span>1 month</span>
                    <span>12 months</span>
                  </div>
                </div>

                {extensionOrder && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-sm text-slate-600">Estimated Extension Cost</div>
                    <div className="text-lg font-bold text-purple-600">
                      ₹{(orders.find(o => o._id === extensionOrder)?.productId?.monthlyRent || 0) * extensionMonths}
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={!extensionOrder}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Extension
                </button>
              </form>
            )}
          </div>

          {maintenanceRequests && maintenanceRequests.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Requests</h2>
              <div className="space-y-3">
                {maintenanceRequests?.filter(req => req && req._id && req.orderId)?.map(req => (
                  <div key={req?._id} className="p-3 border border-slate-100 rounded-lg text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-700 truncate">{req?.orderId?.productId?.name || 'Item'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        req?.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req?.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-slate-500 line-clamp-2">{req?.issue || 'No details'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
