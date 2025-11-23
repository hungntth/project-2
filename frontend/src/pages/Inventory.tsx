import { useEffect, useState } from 'react';
import { inventoryApi, productsApi } from '../services/api';
import { Package, AlertTriangle } from 'lucide-react';

export default function Inventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
    loadLowStock();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await inventoryApi.getAll();
      setInventory(response.data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLowStock = async () => {
    try {
      const response = await inventoryApi.getLowStock(10);
      setLowStock(response.data);
    } catch (error) {
      console.error('Error loading low stock:', error);
    }
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
      <h1 className="text-3xl font-bold mb-6">Quản lý kho hàng</h1>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="card mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-semibold text-yellow-800">
              Cảnh báo tồn kho thấp
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lowStock.map((item: any) => (
              <div key={item.productId} className="bg-white p-3 rounded">
                <p className="font-medium">{item.product?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">
                  Tồn kho:{' '}
                  <span className="font-bold text-red-600">
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
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Danh sách tồn kho</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Sản phẩm</th>
                <th className="text-left py-3 px-4">Số lượng tồn</th>
                <th className="text-left py-3 px-4">Số lượng đã đặt</th>
                <th className="text-left py-3 px-4">Số lượng khả dụng</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Không có dữ liệu tồn kho
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium">
                      {item.product?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          (item.quantity || 0) < 10
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {item.quantity || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.reservedQuantity || 0}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">
                        {item.availableQuantity !== undefined
                          ? item.availableQuantity
                          : (item.quantity || 0) - (item.reservedQuantity || 0)}
                      </span>
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

