import { useEffect, useState } from 'react';
import { reportsApi } from '../services/api';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [sales, products, customers, inventory, revenue, profit] =
        await Promise.all([
          reportsApi.getSalesReport(
            dateRange.startDate || dateRange.endDate ? dateRange : undefined,
          ),
          reportsApi.getProductsReport(
            dateRange.startDate || dateRange.endDate ? dateRange : undefined,
          ),
          reportsApi.getCustomersReport(
            dateRange.startDate || dateRange.endDate ? dateRange : undefined,
          ),
          reportsApi.getInventoryReport(),
          reportsApi.getRevenueReport(
            dateRange.startDate || dateRange.endDate ? dateRange : undefined,
          ),
          reportsApi.getProfitReport(
            dateRange.startDate || dateRange.endDate ? dateRange : undefined,
          ),
        ]);

      setReports({
        sales: sales.data,
        products: products.data,
        customers: customers.data,
        inventory: inventory.data,
        revenue: revenue.data,
        profit: profit.data,
      });
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (key: string, value: string) => {
    setDateRange({ ...dateRange, [key]: value });
  };

  const applyFilters = () => {
    setLoading(true);
    loadReports();
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
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Báo cáo</h1>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Từ ngày</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Đến ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button onClick={applyFilters} className="btn btn-primary w-full">
              Áp dụng
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Report */}
      {reports.revenue && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Báo cáo doanh thu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Tổng doanh thu</label>
              <p className="text-2xl font-bold text-primary-600">
                {new Intl.NumberFormat('vi-VN').format(
                  reports.revenue.totalRevenue || 0,
                )}{' '}
                đ
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Số đơn hàng</label>
              <p className="text-2xl font-bold">
                {reports.revenue.totalOrders || 0}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Trung bình/đơn</label>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('vi-VN').format(
                  (reports.revenue.totalRevenue || 0) /
                    (reports.revenue.totalOrders || 1),
                )}{' '}
                đ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profit Report */}
      {reports.profit && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Báo cáo lợi nhuận</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Tổng lợi nhuận</label>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('vi-VN').format(
                  reports.profit.totalProfit || 0,
                )}{' '}
                đ
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Tổng doanh thu</label>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('vi-VN').format(
                  reports.profit.totalRevenue || 0,
                )}{' '}
                đ
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Tổng chi phí</label>
              <p className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('vi-VN').format(
                  reports.profit.totalCost || 0,
                )}{' '}
                đ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Products */}
      {reports.products && reports.products.topProducts && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm bán chạy</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Sản phẩm</th>
                  <th className="text-left py-3 px-4">Số lượng bán</th>
                  <th className="text-left py-3 px-4">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {reports.products.topProducts.map((product: any) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">{product.quantitySold || 0}</td>
                    <td className="py-3 px-4 font-medium">
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

      {/* Top Customers */}
      {reports.customers && reports.customers.topCustomers && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Khách hàng hàng đầu</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Khách hàng</th>
                  <th className="text-left py-3 px-4">Số đơn hàng</th>
                  <th className="text-left py-3 px-4">Tổng giá trị</th>
                </tr>
              </thead>
              <tbody>
                {reports.customers.topCustomers.map((customer: any) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{customer.name}</td>
                    <td className="py-3 px-4">{customer.orderCount || 0}</td>
                    <td className="py-3 px-4 font-medium">
                      {new Intl.NumberFormat('vi-VN').format(
                        customer.totalSpent || 0,
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

