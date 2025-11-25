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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">Tổng quan hệ thống quản lý bán hàng</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            'bg-green-500': 'from-green-500 to-emerald-600',
            'bg-blue-500': 'from-blue-500 to-cyan-600',
            'bg-purple-500': 'from-purple-500 to-pink-600',
            'bg-orange-500': 'from-orange-500 to-red-500',
          };
          return (
            <div key={index} className="card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                    {stat.value}
                  </p>
                </div>
                <div className={`bg-gradient-to-br ${colorMap[stat.color]} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      {data.recentOrders && data.recentOrders.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Đơn hàng gần đây</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"></div>
          </div>
          <div className="overflow-x-auto rounded-xl">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs font-semibold">{order.id.slice(0, 8)}...</td>
                    <td className="font-medium">{order.customer?.name || 'N/A'}</td>
                    <td className="font-semibold text-primary-600">
                      {new Intl.NumberFormat('vi-VN').format(
                        order.totalAmount || 0,
                      )}{' '}
                      đ
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === 'completed'
                            ? 'badge-success'
                            : order.status === 'pending'
                              ? 'badge-warning'
                              : 'badge-info'
                        }`}
                      >
                        {order.status === 'completed' ? 'Hoàn thành' : 
                         order.status === 'pending' ? 'Chờ xử lý' : order.status}
                      </span>
                    </td>
                    <td className="text-gray-600">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sản phẩm bán chạy</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          </div>
          <div className="overflow-x-auto rounded-xl">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Đã bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((product: any, index: number) => (
                  <tr key={product.id}>
                    <td className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        {product.name}
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-gray-700">{product.quantitySold || 0}</span>
                      <span className="text-gray-500 text-xs ml-1">sản phẩm</span>
                    </td>
                    <td className="font-bold text-green-600">
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

