/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */
import { useState, useEffect, useContext, useCallback } from 'react';
import { Loader2, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext, api } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const AdminOrders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ORDER_STATUSES = ['Pending', 'Approved', 'Rented', 'Returned', 'Cancelled'];

  const NEXT_STATUS = {
    Pending: ['Approved', 'Cancelled'],
    Approved: ['Rented', 'Cancelled'],
    Rented: ['Returned', 'Cancelled'],
    Returned: [],
    Cancelled: []
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      const validOrders = response.data?.filter(o => o && o._id && o.productId && o.productId._id && o.userId && o.userId._id) || [];
      setOrders(validOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      
      // Refetch orders to ensure sync
      const ordersRes = await api.get('/orders');
      const validOrders = ordersRes.data?.filter(o => o && o._id && o.productId && o.productId._id && o.userId && o.userId._id) || [];
      setOrders(validOrders);
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
      // Refetch to ensure UI sync on error
      fetchOrders();
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter && order.status !== statusFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center h-screen items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-6 md:p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Orders Management</h1>
            <p className="text-slate-500 mt-2">View and manage all rental orders</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-5 w-5 text-slate-600" />
              <h3 className="font-semibold text-slate-700">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Status</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Orders</label>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-slate-800">
                  {filteredOrders.length}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Revenue</label>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-blue-600">
                  ₹{filteredOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 mb-4">No orders found</p>
                <a href="/admin/dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Back to Dashboard
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Duration</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Total Cost</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Delivery Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.map(order => (
                      <tr key={order._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-mono text-slate-700">{order._id?.slice(0, 6) || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{order.userId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{order.productId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{order.rentalDuration} months</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">₹{order.totalCost}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Rented' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'Returned' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            className="px-3 py-1 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          >
                            {[order.status, ...(NEXT_STATUS[order.status] || [])].map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Extensions Summary */}
          {filteredOrders.some(order => order.extensions && order.extensions.length > 0) && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Pending Extensions</h2>
              <div className="space-y-3">
                {filteredOrders.map(order => {
                  const pendingExtensions = order.extensions?.filter(ext => ext && ext.status === 'Pending');
                  if (!pendingExtensions || pendingExtensions.length === 0) return null;
                  
                  return (
                    <div key={order._id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-800">{order.productId?.name}</h3>
                          <p className="text-sm text-slate-600">Customer: {order.userId?.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-700">
                            {pendingExtensions.length} pending extension(s)
                          </div>
                          {pendingExtensions.map((ext, idx) => (
                            <div key={idx} className="text-xs text-slate-600 mt-1">
                              {ext.extendedMonths} months - ₹{ext.extendedCost}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;
