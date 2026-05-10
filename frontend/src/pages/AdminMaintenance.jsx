/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */
import { useState, useEffect, useContext, useCallback } from 'react';
import { Loader2, Wrench, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext, api } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const AdminMaintenance = () => {
  const { user, token } = useContext(AuthContext);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const MAINTENANCE_STATUSES = ['Pending', 'In Progress', 'Resolved'];

  const fetchMaintenance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance');
      const validRequests = response.data?.filter(m => m && m._id) || [];
      setMaintenance(validRequests);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      toast.error('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchMaintenance();
  }, [fetchMaintenance]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/maintenance/${id}/status`, { status: newStatus });
      
      // Refetch to ensure sync
      const maintRes = await api.get('/maintenance');
      const validRequests = maintRes.data?.filter(m => m && m._id) || [];
      setMaintenance(validRequests);
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
      fetchMaintenance();
    }
  };

  const filteredMaintenance = maintenance.filter(req => {
    if (statusFilter && req.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

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
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="h-8 w-8 text-slate-700" />
              <h1 className="text-3xl font-bold text-slate-800">Maintenance Requests</h1>
            </div>
            <p className="text-slate-500 mt-2">View and manage all maintenance requests</p>
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
                  {MAINTENANCE_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Requests</label>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-slate-800">
                  {filteredMaintenance.length}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pending</label>
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-yellow-600">
                  {filteredMaintenance.filter(m => m.status === 'Pending').length}
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {filteredMaintenance.length === 0 ? (
              <div className="p-8 text-center">
                <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">No maintenance requests found</p>
                <a href="/admin/dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Back to Dashboard
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Request ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Issue</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredMaintenance.map(req => (
                      <tr key={req._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-mono text-slate-700">{req._id?.slice(0, 6) || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {req.orderId?.userId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {req.orderId?.productId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate" title={req.issue}>
                          {req.issue || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                            {req.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select 
                            className="px-3 py-1 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={req.status || 'Pending'}
                            onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                          >
                            {MAINTENANCE_STATUSES.map(status => (
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
        </div>
      </main>
    </div>
  );
};

export default AdminMaintenance;
