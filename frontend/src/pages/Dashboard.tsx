import { useEffect, useState } from 'react';
import { reportsApi } from '../services/api';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

interface DashboardData {
  totalRevenue?: number;
  totalOrders?: number;
  totalCustomers?: number;
  totalProducts?: number;
  recentOrders?: any[];
  topProducts?: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await reportsApi.getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Tổng doanh thu',
      value: data.totalRevenue
        ? new Intl.NumberFormat('vi-VN').format(data.totalRevenue) + ' đ'
        : '0 đ',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Tổng đơn hàng',
      value: data.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      label: 'Tổng khách hàng',
      value: data.totalCustomers || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Tổng sản phẩm',
      value: data.totalProducts || 0,
      icon: Package,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      {data.recentOrders && data.recentOrders.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Đơn hàng gần đây</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Mã đơn</th>
                  <th className="text-left py-3 px-4">Khách hàng</th>
                  <th className="text-left py-3 px-4">Tổng tiền</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">
                      {order.customer?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
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
                        ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Products */}
      {data.topProducts && data.topProducts.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm bán chạy</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tên sản phẩm</th>
                  <th className="text-left py-3 px-4">Đã bán</th>
                  <th className="text-left py-3 px-4">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((product: any) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">{product.quantitySold || 0}</td>
                    <td className="py-3 px-4">
                      {new Intl.NumberFormat('vi-VN').format(
                        product.revenue || 0,
                      )}{' '}
                      đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

