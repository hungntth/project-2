import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { Plus, Eye, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await ordersApi.getAll(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    setLoading(true);
    loadOrders();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Chờ xử lý',
      },
      processing: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Đang xử lý',
      },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Hoàn thành',
      },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };
    const statusStyle = statusMap[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: status,
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}
      >
        {statusStyle.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Đơn hàng
          </h1>
          <p className="text-gray-600">Quản lý đơn hàng và giao dịch</p>
        </div>
        <Link
          to="/orders/create"
          className="btn btn-primary flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Tạo đơn hàng
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="label">Từ ngày</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Đến ngày</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button onClick={applyFilters} className="btn btn-primary w-full">
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Danh sách đơn hàng</h2>
          </div>
          <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th className="text-right">Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs font-semibold">{order.id.slice(0, 8)}...</td>
                    <td className="font-medium">{order.customer?.name || 'N/A'}</td>
                    <td className="text-right">
                      <span className="font-bold text-primary-600 text-lg">
                        {new Intl.NumberFormat('vi-VN').format(
                          order.totalAmount || 0,
                        )}{' '}
                        đ
                      </span>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className="text-gray-600">
                      {order.createdAt
                        ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')
                        : 'N/A'}
                    </td>
                    <td className="text-center">
                      <Link
                        to={`/orders/${order.id}`}
                        className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all hover:scale-110 inline-block"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

