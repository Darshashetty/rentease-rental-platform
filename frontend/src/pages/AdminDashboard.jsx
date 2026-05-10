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
    Completed: [],
  };

  const fetchAdminData = useCallback(async () => {
    try {
      const [statsRes, ordersRes, maintRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/orders'),
        api.get('/maintenance'),
      ]);

      setStats(statsRes.data?.dashboard || statsRes.data);
      setOrders(
        ordersRes.data?.filter(
          (order) => order && order._id && order.productId && order.productId._id && order.userId && order.userId._id
        ) || []
      );
      setMaintenance(maintRes.data?.filter((item) => item && item._id) || []);
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
      const ordersRes = await api.get('/orders');
      setOrders(
        ordersRes.data?.filter(
          (order) => order && order._id && order.productId && order.productId._id && order.userId && order.userId._id
        ) || []
      );
      const statsRes = await api.get('/admin/dashboard');
      setStats(statsRes.data?.dashboard || statsRes.data);
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleMaintenanceStatusUpdate = async (id, status) => {
    try {
      await api.put(`/maintenance/${id}/status`, { status });
      const maintRes = await api.get('/maintenance');
      setMaintenance(maintRes.data?.filter((item) => item && item._id) || []);
      toast.success(`Maintenance request marked as ${status}`);
    } catch (error) {
      console.error('Error updating maintenance status', error);
      toast.error(error.response?.data?.message || 'Failed to update maintenance status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 px-4 py-6 lg:py-8">
        <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500">Monitor orders, maintenance, and platform health at a glance.</p>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="bg-blue-100 p-4 rounded-xl text-blue-600"><Users className="h-6 w-6" /></div>
                <div>
                  <p className="text-slate-500 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalUsers ?? stats.userStats?.totalUsers ?? 0}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="bg-green-100 p-4 rounded-xl text-green-600"><DollarSign className="h-6 w-6" /></div>
                <div>
                  <p className="text-slate-500 text-sm">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-slate-800">₹{stats.monthlyRecurringRevenue ?? stats.financialStats?.totalRevenue ?? 0}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="bg-purple-100 p-4 rounded-xl text-purple-600"><Package className="h-6 w-6" /></div>
                <div>
                  <p className="text-slate-500 text-sm">Active Rentals</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.activeRentals ?? stats.bookingStats?.active ?? 0}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="bg-amber-100 p-4 rounded-xl text-amber-600"><Activity className="h-6 w-6" /></div>
                <div>
                  <p className="text-slate-500 text-sm">Utilization Rate</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.utilizationRate ?? 0}%</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-t-2xl flex gap-0 overflow-hidden shadow-sm">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Orders
              </div>
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-5 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'maintenance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5" /> Maintenance ({maintenance.length})
              </div>
            </button>
          </div>

          {activeTab === 'orders' && (
            <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 lg:p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                      <th className="p-3 lg:p-4 font-medium">Order ID</th>
                      <th className="p-3 lg:p-4 font-medium">Customer</th>
                      <th className="p-3 lg:p-4 font-medium">Product</th>
                      <th className="p-3 lg:p-4 font-medium">Total</th>
                      <th className="p-3 lg:p-4 font-medium">Status</th>
                      <th className="p-3 lg:p-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500">No orders found.</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm">
                          <td className="p-3 lg:p-4 font-mono text-xs text-slate-500">{order._id?.substring(18) || 'N/A'}</td>
                          <td className="p-3 lg:p-4 font-medium text-slate-800">{order.userId?.name || 'Unknown User'}</td>
                          <td className="p-3 lg:p-4 text-slate-600">{order.productId?.name || 'Unknown Product'}</td>
                          <td className="p-3 lg:p-4 font-medium">₹{order.totalCost || 0}</td>
                          <td className="p-3 lg:p-4">
                            <span
                              className={`px-2 py-1 text-xs font-bold rounded-full ${
                                order.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                order.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'Rented' ? 'bg-purple-100 text-purple-800' :
                                order.status === 'Returned' ? 'bg-green-100 text-green-800' :
                                order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'Delivered' ? 'bg-purple-100 text-purple-800' :
                                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {order.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="p-3 lg:p-4">
                            <select
                              className="border border-slate-200 rounded text-xs p-1 outline-none focus:border-blue-500 cursor-pointer hover:border-slate-300 transition"
                              value={order.status || 'Pending'}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            >
                              {[order.status, ...(NEXT_STATUS[order.status] || [])].map((status) => (
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

          {activeTab === 'maintenance' && (
            <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 lg:p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Maintenance Requests</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                      <th className="p-3 lg:p-4 font-medium">Request ID</th>
                      <th className="p-3 lg:p-4 font-medium">Customer</th>
                      <th className="p-3 lg:p-4 font-medium">Product</th>
                      <th className="p-3 lg:p-4 font-medium">Issue</th>
                      <th className="p-3 lg:p-4 font-medium">Status</th>
                      <th className="p-3 lg:p-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500">No maintenance requests found.</td>
                      </tr>
                    ) : (
                      maintenance.map((item) => (
                        <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm">
                          <td className="p-3 lg:p-4 font-mono text-xs text-slate-500">{item._id?.substring(18) || 'N/A'}</td>
                          <td className="p-3 lg:p-4 font-medium text-slate-800">{item.userId?.name || 'Unknown User'}</td>
                          <td className="p-3 lg:p-4 text-slate-600">{item.orderId?.productId?.name || 'Unknown Product'}</td>
                          <td className="p-3 lg:p-4 text-slate-600">{item.issue || 'No details'}</td>
                          <td className="p-3 lg:p-4">
                            <span
                              className={`px-2 py-1 text-xs font-bold rounded-full ${
                                item.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-3 lg:p-4">
                            <select
                              className="border border-slate-200 rounded text-xs p-1 outline-none focus:border-blue-500 cursor-pointer hover:border-slate-300 transition"
                              value={item.status || 'Pending'}
                              onChange={(e) => handleMaintenanceStatusUpdate(item._id, e.target.value)}
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