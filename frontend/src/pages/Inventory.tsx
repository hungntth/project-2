import { useEffect, useState } from 'react';
import { inventoryApi, productsApi, suppliersApi } from '../services/api';
import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, X, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

interface PeriodData {
  productId: string;
  openingBalance: number;
  totalImport: number;
  totalExport: number;
  closingBalance: number;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [periodData, setPeriodData] = useState<Map<string, PeriodData>>(new Map());
  const [selectedPeriod, setSelectedPeriod] = useState(
    format(new Date(), 'yyyy-MM'),
  );
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importForm, setImportForm] = useState({
    productId: '',
    quantity: '',
    supplierId: '',
    notes: '',
  });
  const [exportForm, setExportForm] = useState({
    productId: '',
    quantity: '',
    orderId: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      loadInventory();
      loadLowStock();
      loadPeriodData();
      loadTransactions();
    }
  }, [selectedPeriod, products]);

  const loadInventory = async () => {
    try {
      const response = await inventoryApi.getAll();
      setInventory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLowStock = async () => {
    try {
      const response = await inventoryApi.getLowStock(10);
      setLowStock(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading low stock:', error);
    }
  };

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

  const loadSuppliers = async () => {
    try {
      const response = await suppliersApi.getAll();
      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadPeriodData = async () => {
    try {
      // Sử dụng API mới để lấy tồn kho theo kỳ
      const periodResponse = await inventoryApi.getPeriodInventory(selectedPeriod);
      const periodInventories = Array.isArray(periodResponse.data)
        ? periodResponse.data
        : [];

      const dataMap = new Map<string, PeriodData>();

      // Khởi tạo từ period data
      periodInventories.forEach((period: any) => {
        dataMap.set(period.productId, {
          productId: period.productId,
          openingBalance: period.openingBalance || 0,
          totalImport: period.totalImport || 0,
          totalExport: period.totalExport || 0,
          closingBalance: period.closingBalance || 0,
        });
      });

      // Nếu không có data từ period, tính từ transactions (fallback)
      if (periodInventories.length === 0) {
        const periodDate = parseISO(`${selectedPeriod}-01`);
        const periodStart = startOfMonth(periodDate);
        const periodEnd = endOfMonth(periodDate);

        const historyResponse = await inventoryApi.getHistory();
        const allTransactions = Array.isArray(historyResponse.data)
          ? historyResponse.data
          : [];

        const periodTransactions = allTransactions.filter((t: any) => {
          const transactionDate = new Date(t.createdAt);
          return transactionDate >= periodStart && transactionDate <= periodEnd;
        });

        const beforePeriodTransactions = allTransactions.filter((t: any) => {
          const transactionDate = new Date(t.createdAt);
          return transactionDate < periodStart;
        });

        products.forEach((product) => {
          dataMap.set(product.id, {
            productId: product.id,
            openingBalance: 0,
            totalImport: 0,
            totalExport: 0,
            closingBalance: 0,
          });
        });

        beforePeriodTransactions.forEach((t: any) => {
          const data = dataMap.get(t.productId);
          if (data) {
            if (t.type === 'IMPORT') {
              data.openingBalance += t.quantity;
            } else if (t.type === 'EXPORT') {
              data.openingBalance -= t.quantity;
            } else if (t.type === 'ADJUSTMENT') {
              data.openingBalance = t.newQuantity;
            }
          }
        });

        periodTransactions.forEach((t: any) => {
          const data = dataMap.get(t.productId);
          if (data) {
            if (t.type === 'IMPORT') {
              data.totalImport += t.quantity;
            } else if (t.type === 'EXPORT') {
              data.totalExport += t.quantity;
            } else if (t.type === 'ADJUSTMENT') {
              data.openingBalance = t.previousQuantity;
            }
          }
        });

        dataMap.forEach((data) => {
          data.closingBalance =
            data.openingBalance + data.totalImport - data.totalExport;
        });
      }

      setPeriodData(dataMap);
    } catch (error) {
      console.error('Error loading period data:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const periodDate = parseISO(`${selectedPeriod}-01`);
      const periodStart = startOfMonth(periodDate);
      const periodEnd = endOfMonth(periodDate);

      const historyResponse = await inventoryApi.getHistory();
      const allTransactions = Array.isArray(historyResponse.data)
        ? historyResponse.data
        : [];

      const periodTransactions = allTransactions.filter((t: any) => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= periodStart && transactionDate <= periodEnd;
      });

      setTransactions(periodTransactions.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inventoryApi.import({
        productId: importForm.productId,
        quantity: parseInt(importForm.quantity),
        supplierId: importForm.supplierId || undefined,
        notes: importForm.notes || undefined,
      });
      alert('Nhập kho thành công!');
      setShowImportModal(false);
      setImportForm({ productId: '', quantity: '', supplierId: '', notes: '' });
      loadInventory();
      loadLowStock();
      loadPeriodData();
      loadTransactions();
    } catch (error: any) {
      console.error('Error importing inventory:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi nhập kho');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inventoryApi.export({
        productId: exportForm.productId,
        quantity: parseInt(exportForm.quantity),
        orderId: exportForm.orderId || undefined,
        notes: exportForm.notes || undefined,
      });
      alert('Xuất kho thành công!');
      setShowExportModal(false);
      setExportForm({ productId: '', quantity: '', orderId: '', notes: '' });
      loadInventory();
      loadLowStock();
      loadPeriodData();
      loadTransactions();
    } catch (error: any) {
      console.error('Error exporting inventory:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xuất kho');
    } finally {
      setSubmitting(false);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Quản lý kho hàng
          </h1>
          <p className="text-gray-600">Theo dõi tồn kho và giao dịch nhập xuất</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-gray-200">
            <Calendar className="w-5 h-5 text-primary-600" />
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input border-0 bg-transparent p-0 focus:ring-0 text-sm font-medium"
            />
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="btn btn-primary flex items-center gap-2 shadow-lg"
          >
            <ArrowDownCircle className="w-5 h-5" />
            Nhập kho
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-lg"
          >
            <ArrowUpCircle className="w-5 h-5" />
            Xuất kho
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="card mb-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-900">
                Cảnh báo tồn kho thấp
              </h2>
              <p className="text-sm text-yellow-700">Có {lowStock.length} sản phẩm cần nhập thêm</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lowStock.map((item: any) => (
              <div key={item.productId} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all">
                <p className="font-semibold text-gray-800 mb-1">{item.product?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">
                  Tồn kho:{' '}
                  <span className="font-bold text-red-600 text-lg">
                    {item.quantity}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Danh sách tồn kho</h2>
              <p className="text-sm text-gray-600">Kỳ {format(parseISO(`${selectedPeriod}-01`), 'MM/yyyy')}</p>
            </div>
          </div>
          <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"></div>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th className="text-right">Tồn đầu kỳ</th>
                <th className="text-right">Nhập trong kỳ</th>
                <th className="text-right">Xuất trong kỳ</th>
                <th className="text-right">Tồn cuối kỳ</th>
                <th className="text-right">Số lượng đã đặt</th>
                <th className="text-right">Số lượng khả dụng</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Không có dữ liệu tồn kho
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const period = periodData.get(item.productId);
                  const availableQty = period
                    ? period.closingBalance - (item.reservedQuantity || 0)
                    : item.availableQuantity !== undefined
                      ? item.availableQuantity
                      : (item.quantity || 0) - (item.reservedQuantity || 0);
                  return (
                    <tr key={item.productId}>
                      <td className="font-semibold">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary-600" />
                          </div>
                          <span>{item.product?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="text-right font-medium">{period?.openingBalance ?? 0}</td>
                      <td className="text-right">
                        <span className="inline-flex items-center font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                          +{period?.totalImport ?? 0}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="inline-flex items-center font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                          -{period?.totalExport ?? 0}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="inline-flex items-center font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                          {period?.closingBalance ?? item.quantity ?? 0}
                        </span>
                      </td>
                      <td className="text-right font-medium text-gray-700">{item.reservedQuantity || 0}</td>
                      <td className="text-right">
                        <span className="inline-flex items-center font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                          {availableQty}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setImportForm({ ...importForm, productId: item.productId });
                              setShowImportModal(true);
                            }}
                            className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all hover:scale-110"
                            title="Nhập kho"
                          >
                            <ArrowDownCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setExportForm({ ...exportForm, productId: item.productId });
                              setShowExportModal(true);
                            }}
                            className="p-2.5 text-green-600 hover:bg-green-100 rounded-xl transition-all hover:scale-110"
                            title="Xuất kho"
                          >
                            <ArrowUpCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Lịch sử giao dịch</h2>
              <p className="text-sm text-gray-600">Kỳ {format(parseISO(`${selectedPeriod}-01`), 'MM/yyyy')}</p>
            </div>
          </div>
          <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Ngày giờ</th>
                <th>Sản phẩm</th>
                <th className="whitespace-nowrap">Loại</th>
                <th className="text-right">Số lượng</th>
                <th className="text-right">Tồn trước</th>
                <th className="text-right">Tồn sau</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Không có giao dịch nào trong kỳ này
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const product = products.find(
                    (p) => p.id === transaction.productId,
                  );
                  const getTypeLabel = (type: string) => {
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
                  const getTypeColor = (type: string) => {
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
                  return (
                    <tr key={transaction.id}>
                      <td className="font-mono text-xs">
                        {format(
                          new Date(transaction.createdAt),
                          'dd/MM/yyyy HH:mm',
                        )}
                      </td>
                      <td className="font-medium">{product?.name || transaction.productId}</td>
                      <td className="whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTypeColor(transaction.type)}`}>
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className={`font-bold ${
                          transaction.type === 'EXPORT' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {transaction.type === 'EXPORT' ? '-' : '+'}
                          {transaction.quantity}
                        </span>
                      </td>
                      <td className="text-right font-medium text-gray-700">
                        {transaction.previousQuantity}
                      </td>
                      <td className="text-right">
                        <span className="inline-flex items-center font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                          {transaction.newQuantity}
                        </span>
                      </td>
                      <td className="text-sm text-gray-600 italic">
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ArrowDownCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Nhập kho</h2>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportForm({ productId: '', quantity: '', supplierId: '', notes: '' });
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="label">Sản phẩm *</label>
                <select
                  required
                  value={importForm.productId}
                  onChange={(e) => setImportForm({ ...importForm, productId: e.target.value })}
                  className="input"
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Số lượng *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={importForm.quantity}
                  onChange={(e) => setImportForm({ ...importForm, quantity: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Nhà cung cấp</label>
                <select
                  value={importForm.supplierId}
                  onChange={(e) => setImportForm({ ...importForm, supplierId: e.target.value })}
                  className="input"
                >
                  <option value="">Không chọn</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Ghi chú</label>
                <textarea
                  value={importForm.notes}
                  onChange={(e) => setImportForm({ ...importForm, notes: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? 'Đang xử lý...' : 'Nhập kho'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportForm({ productId: '', quantity: '', supplierId: '', notes: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ArrowUpCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Xuất kho</h2>
                </div>
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    setExportForm({ productId: '', quantity: '', orderId: '', notes: '' });
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleExport} className="space-y-4">
              <div>
                <label className="label">Sản phẩm *</label>
                <select
                  required
                  value={exportForm.productId}
                  onChange={(e) => setExportForm({ ...exportForm, productId: e.target.value })}
                  className="input"
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Số lượng *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={exportForm.quantity}
                  onChange={(e) => setExportForm({ ...exportForm, quantity: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Mã đơn hàng</label>
                <input
                  type="text"
                  value={exportForm.orderId}
                  onChange={(e) => setExportForm({ ...exportForm, orderId: e.target.value })}
                  className="input"
                  placeholder="Nhập mã đơn hàng (nếu có)"
                />
              </div>
              <div>
                <label className="label">Ghi chú</label>
                <textarea
                  value={exportForm.notes}
                  onChange={(e) => setExportForm({ ...exportForm, notes: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex-1"
                >
                  {submitting ? 'Đang xử lý...' : 'Xuất kho'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExportModal(false);
                    setExportForm({ productId: '', quantity: '', orderId: '', notes: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

