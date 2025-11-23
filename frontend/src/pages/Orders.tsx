import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { Plus, Eye } from 'lucide-react';
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
        className={`px-2 py-1 rounded text-sm ${statusStyle.bg} ${statusStyle.text}`}
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Đơn hàng</h1>
        <Link
          to="/orders/create"
          className="btn btn-primary flex items-center gap-2"
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Mã đơn</th>
                <th className="text-left py-3 px-4">Khách hàng</th>
                <th className="text-left py-3 px-4">Tổng tiền</th>
                <th className="text-left py-3 px-4">Trạng thái</th>
                <th className="text-left py-3 px-4">Ngày tạo</th>
                <th className="text-left py-3 px-4">Thao tác</th>
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
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{order.id}</td>
                    <td className="py-3 px-4">
                      {order.customer?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {new Intl.NumberFormat('vi-VN').format(
                        order.totalAmount || 0,
                      )}{' '}
                      đ
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3 px-4">
                      {order.createdAt
                        ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/orders/${order.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded inline-block"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
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

