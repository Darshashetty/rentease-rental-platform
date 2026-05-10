/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */
import { useState, useEffect, useContext, useCallback } from 'react';
import { Loader2, Users, Package, DollarSign, Activity, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext, api } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const NEXT_STATUS = {
    Pending: ['Approved', 'Cancelled'],
    Approved: ['Rented', 'Cancelled'],
    Rented: ['Returned', 'Cancelled'],
    Returned: [],
    Cancelled: [],
    Confirmed: ['Rented', 'Cancelled'],
    Delivered: ['Rented', 'Returned', 'Cancelled'],
    Active: ['Returned', 'Cancelled'],
    Completed: []
  };

  const fetchAdminData = useCallback(async () => {
    try {
      const [statsRes, ordersRes, maintRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/orders'),
        api.get('/maintenance')
      ]);
      const dashboardStats = statsRes.data?.dashboard || statsRes.data;
      setStats(dashboardStats);
      const validOrders = ordersRes.data?.filter(o => o && o._id && o.productId && o.productId._id && o.userId && o.userId._id) || [];
      setOrders(validOrders);
      const validMaint = maintRes.data?.filter(m => m && m._id) || [];
      setMaintenance(validMaint);
    } catch (error) {
      console.error('Error fetching admin data', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchAdminData();
  }, [fetchAdminData]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      // Refetch orders to ensure state is in sync with backend
      const ordersRes = await api.get('/orders');
      const validOrders = ordersRes.data?.filter(o => o && o._id && o.productId && o.productId._id && o.userId && o.userId._id) || [];
      setOrders(validOrders);
      // Also refetch stats as they depend on order statuses
      const statsRes = await api.get('/admin/dashboard');
      setStats(statsRes.data);
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleMaintenanceStatusUpdate = async (id, status) => {
    try {
      await api.put(`/maintenance/${id}/status`, { status });
      // Refetch maintenance to ensure state is in sync with backend
      const maintRes = await api.get('/maintenance');
      const validMaint = maintRes.data?.filter(m => m && m._id) || [];
      setMaintenance(validMaint);
      toast.success(`Maintenance request marked as ${status}`);
    } catch (error) {
      console.error('Error updating maintenance status', error);
      toast.error(error.response?.data?.message || 'Failed to update maintenance status');
    }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600"/></div>;

  return (
    <div className="flex gap-6">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 px-4 py-8">
        <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-xl text-blue-600"><Users className="h-6 w-6" /></div>
            <div>
              <p className="text-slate-500 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalUsers ?? stats.userStats?.totalUsers ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-xl text-green-600"><DollarSign className="h-6 w-6" /></div>
            <div>
              <p className="text-slate-500 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-slate-800">₹{stats.monthlyRecurringRevenue ?? stats.financialStats?.totalRevenue ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-xl text-purple-600"><Package className="h-6 w-6" /></div>
            <div>
              <p className="text-slate-500 text-sm">Active Rentals</p>
              <p className="text-2xl font-bold text-slate-800">{stats.activeRentals ?? stats.bookingStats?.active ?? 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-amber-100 p-4 rounded-xl text-amber-600"><Activity className="h-6 w-6" /></div>
            <div>
              <p className="text-slate-500 text-sm">Utilization Rate</p>
              <p className="text-2xl font-bold text-slate-800">{stats.utilizationRate ?? 0}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-100 mb-6 rounded-t-2xl flex gap-0">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'orders' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Orders
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('maintenance')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'maintenance' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Maintenance ({maintenance.length})
          </div>
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-b-2xl shadow-sm border border-t-0 border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">No orders found.</td>
                  </tr>
                ) : (
                  orders?.filter(order => order && order._id && order.productId && order.productId._id && order.userId && order.userId._id)?.map(order => (
                    <tr key={order?._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm">
                      <td className="p-4 font-mono text-xs text-slate-500">{order?._id?.substring(18) || 'N/A'}</td>
                      <td className="p-4 font-medium text-slate-800">{order?.userId?.name || 'Unknown User'}</td>
                      <td className="p-4 text-slate-600">{order?.productId?.name || 'Unknown Product'}</td>
                      <td className="p-4 font-medium">₹{order?.totalCost || 0}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          order?.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          order?.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                          order?.status === 'Rented' ? 'bg-purple-100 text-purple-800' :
                          order?.status === 'Returned' ? 'bg-green-100 text-green-800' :
                          order?.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                          order?.status === 'Delivered' ? 'bg-purple-100 text-purple-800' :
                          order?.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {order?.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          className="border border-slate-200 rounded text-xs p-1 outline-none focus:border-blue-500 cursor-pointer hover:border-slate-300 transition"
                          value={order?.status || 'Pending'}
                          onChange={(e) => handleStatusUpdate(order?._id, e.target.value)}
                        >
                          {[order?.status, ...(NEXT_STATUS[order?.status] || [])].map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-b-2xl shadow-sm border border-t-0 border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Maintenance Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-4 font-medium">Request ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Issue</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {maintenance?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">No maintenance requests found.</td>
                  </tr>
                ) : (
                  maintenance?.filter(m => m && m._id)?.map(m => (
                    <tr key={m?._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm">
                      <td className="p-4 font-mono text-xs text-slate-500">{m?._id?.substring(18) || 'N/A'}</td>
                      <td className="p-4 font-medium text-slate-800">{m?.userId?.name || 'Unknown User'}</td>
                      <td className="p-4 text-slate-600">{m?.orderId?.productId?.name || 'Unknown Product'}</td>
                      <td className="p-4 text-slate-600 max-w-xs truncate">{m?.issue || 'No details'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          m?.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          m?.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {m?.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          className="border border-slate-200 rounded text-xs p-1 outline-none focus:border-blue-500 cursor-pointer hover:border-slate-300 transition"
                          value={m?.status || 'Pending'}
                          onChange={(e) => handleMaintenanceStatusUpdate(m?._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
