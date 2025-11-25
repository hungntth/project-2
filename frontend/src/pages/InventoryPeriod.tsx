import { useEffect, useState } from 'react';
import { inventoryApi, productsApi } from '../services/api';
import { Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

interface PeriodReport {
  productId: string;
  productName: string;
  openingBalance: number; // Tồn kho đầu kỳ
  totalImport: number; // Tổng nhập trong kỳ
  totalExport: number; // Tổng xuất trong kỳ
  closingBalance: number; // Tồn kho cuối kỳ
}

export default function InventoryPeriod() {
  const [selectedPeriod, setSelectedPeriod] = useState(
    format(new Date(), 'yyyy-MM'),
  );
  const [reports, setReports] = useState<PeriodReport[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      loadPeriodReport();
    }
  }, [selectedPeriod, products]);

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAll();
      const productsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadPeriodReport = async () => {
    setLoading(true);
    try {
      const periodDate = parseISO(`${selectedPeriod}-01`);
      const periodStart = startOfMonth(periodDate);
      const periodEnd = endOfMonth(periodDate);

      // Load all transactions for the period
      const historyResponse = await inventoryApi.getHistory();
      const allTransactions = Array.isArray(historyResponse.data)
        ? historyResponse.data
        : [];

      // Filter transactions by period
      const periodTransactions = allTransactions.filter((t: any) => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= periodStart && transactionDate <= periodEnd;
      });

      setTransactions(periodTransactions);

      // Calculate report for each product
      const reportMap = new Map<string, PeriodReport>();

      // Initialize all products
      products.forEach((product) => {
        reportMap.set(product.id, {
          productId: product.id,
          productName: product.name,
          openingBalance: 0,
          totalImport: 0,
          totalExport: 0,
          closingBalance: 0,
        });
      });

      // Calculate opening balance (sum of all transactions before period start)
      const beforePeriodTransactions = allTransactions.filter((t: any) => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate < periodStart;
      });

      beforePeriodTransactions.forEach((t: any) => {
        const report = reportMap.get(t.productId);
        if (report) {
          if (t.type === 'IMPORT') {
            report.openingBalance += t.quantity;
          } else if (t.type === 'EXPORT') {
            report.openingBalance -= t.quantity;
          } else if (t.type === 'ADJUSTMENT') {
            report.openingBalance = t.newQuantity;
          }
        }
      });

      // Calculate period transactions
      periodTransactions.forEach((t: any) => {
        const report = reportMap.get(t.productId);
        if (report) {
          if (t.type === 'IMPORT') {
            report.totalImport += t.quantity;
          } else if (t.type === 'EXPORT') {
            report.totalExport += t.quantity;
          } else if (t.type === 'ADJUSTMENT') {
            // For adjustment, update opening balance
            report.openingBalance = t.previousQuantity;
          }
        }
      });

      // Calculate closing balance
      reportMap.forEach((report) => {
        report.closingBalance =
          report.openingBalance + report.totalImport - report.totalExport;
      });

      // Get current inventory to verify closing balance
      const inventoryResponse = await inventoryApi.getAll();
      const currentInventory = Array.isArray(inventoryResponse.data)
        ? inventoryResponse.data
        : [];

      currentInventory.forEach((inv: any) => {
        const report = reportMap.get(inv.productId);
        if (report) {
          // If this is current period, use calculated closing balance
          const isCurrentPeriod =
            format(new Date(), 'yyyy-MM') === selectedPeriod;
          if (isCurrentPeriod) {
            report.closingBalance = inv.quantity || 0;
          }
        }
      });

      setReports(Array.from(reportMap.values()));
    } catch (error) {
      console.error('Error loading period report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransactions = (productId: string) => {
    setSelectedProductId(productId);
    setShowTransactions(true);
  };

  const filteredTransactions = selectedProductId
    ? transactions.filter((t) => t.productId === selectedProductId)
    : transactions;

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'IMPORT':
        return 'Nhập kho';
      case 'EXPORT':
        return 'Xuất kho';
      case 'ADJUSTMENT':
        return 'Điều chỉnh';
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'IMPORT':
        return 'bg-blue-100 text-blue-800';
      case 'EXPORT':
        return 'bg-green-100 text-green-800';
      case 'ADJUSTMENT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalOpening = reports.reduce((sum, r) => sum + r.openingBalance, 0);
  const totalImport = reports.reduce((sum, r) => sum + r.totalImport, 0);
  const totalExport = reports.reduce((sum, r) => sum + r.totalExport, 0);
  const totalClosing = reports.reduce((sum, r) => sum + r.closingBalance, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Báo cáo tồn kho theo kỳ</h1>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tồn kho đầu kỳ</p>
              <p className="text-2xl font-bold">{totalOpening}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng nhập trong kỳ</p>
              <p className="text-2xl font-bold text-blue-600">
                +{totalImport}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng xuất trong kỳ</p>
              <p className="text-2xl font-bold text-red-600">
                -{totalExport}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tồn kho cuối kỳ</p>
              <p className="text-2xl font-bold text-primary-600">
                {totalClosing}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Period Report Table */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Chi tiết tồn kho kỳ {format(parseISO(`${selectedPeriod}-01`), 'MM/yyyy')}
          </h2>
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="btn btn-secondary"
          >
            {showTransactions ? 'Ẩn' : 'Xem'} lịch sử giao dịch
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Sản phẩm</th>
                <th className="text-right py-3 px-4">Tồn đầu kỳ</th>
                <th className="text-right py-3 px-4">Nhập trong kỳ</th>
                <th className="text-right py-3 px-4">Xuất trong kỳ</th>
                <th className="text-right py-3 px-4">Tồn cuối kỳ</th>
                <th className="text-center py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.productId} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {report.productName}
                    </td>
                    <td className="py-3 px-4 text-right">{report.openingBalance}</td>
                    <td className="py-3 px-4 text-right text-blue-600 font-medium">
                      +{report.totalImport}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      -{report.totalExport}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-primary-600">
                      {report.closingBalance}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewTransactions(report.productId)}
                        className="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold">
                <td className="py-3 px-4">Tổng cộng</td>
                <td className="py-3 px-4 text-right">{totalOpening}</td>
                <td className="py-3 px-4 text-right text-blue-600">
                  +{totalImport}
                </td>
                <td className="py-3 px-4 text-right text-red-600">
                  -{totalExport}
                </td>
                <td className="py-3 px-4 text-right text-primary-600">
                  {totalClosing}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Transactions History */}
      {showTransactions && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lịch sử giao dịch</h2>
            {selectedProductId && (
              <button
                onClick={() => {
                  setSelectedProductId(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Xem tất cả
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Ngày giờ</th>
                  <th className="text-left py-3 px-4">Sản phẩm</th>
                  <th className="text-left py-3 px-4">Loại</th>
                  <th className="text-right py-3 px-4">Số lượng</th>
                  <th className="text-right py-3 px-4">Tồn trước</th>
                  <th className="text-right py-3 px-4">Tồn sau</th>
                  <th className="text-left py-3 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Không có giao dịch nào trong kỳ này
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const product = products.find(
                      (p) => p.id === transaction.productId,
                    );
                    return (
                      <tr
                        key={transaction.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          {format(
                            new Date(transaction.createdAt),
                            'dd/MM/yyyy HH:mm',
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {product?.name || transaction.productId}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTransactionTypeColor(
                              transaction.type,
                            )}`}
                          >
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {transaction.type === 'EXPORT' ? '-' : '+'}
                          {transaction.quantity}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {transaction.previousQuantity}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {transaction.newQuantity}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {transaction.notes || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

