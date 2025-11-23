import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersApi } from '../services/api';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCustomer();
      loadOrders();
      loadStatistics();
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      const response = await customersApi.getById(id!);
      setCustomer(response.data);
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await customersApi.getOrders(id!);
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await customersApi.getStatistics(id!);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy khách hàng</p>
        <button
          onClick={() => navigate('/customers')}
          className="text-primary-600 hover:underline mt-4"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">{customer.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Tên</label>
              <p className="font-medium">{customer.name}</p>
            </div>
            {customer.email && (
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p>{customer.email}</p>
              </div>
            )}
            {customer.phone && (
              <div>
                <label className="text-sm text-gray-600">Số điện thoại</label>
                <p>{customer.phone}</p>
              </div>
            )}
            {customer.address && (
              <div>
                <label className="text-sm text-gray-600">Địa chỉ</label>
                <p>{customer.address}</p>
              </div>
            )}
            {(customer.city || customer.country) && (
              <div>
                <label className="text-sm text-gray-600">
                  Thành phố / Quốc gia
                </label>
                <p>
                  {[customer.city, customer.country].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Thống kê</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Tổng đơn hàng</label>
                <p className="text-2xl font-bold">
                  {statistics.totalOrders || 0}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tổng giá trị</label>
                <p className="text-2xl font-bold text-primary-600">
                  {new Intl.NumberFormat('vi-VN').format(
                    statistics.totalSpent || 0,
                  )}{' '}
                  đ
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Lịch sử đơn hàng</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có đơn hàng nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Mã đơn</th>
                  <th className="text-left py-3 px-4">Tổng tiền</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{order.id}</td>
                    <td className="py-3 px-4 font-medium">
                      {new Intl.NumberFormat('vi-VN').format(
                        order.totalAmount || 0,
                      )}{' '}
                      đ
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {order.createdAt
                        ? format(new Date(order.createdAt), 'dd/MM/yyyy')
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

