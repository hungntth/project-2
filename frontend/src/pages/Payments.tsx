import { useEffect, useState } from 'react';
import { paymentsApi } from '../services/api';
import { CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await paymentsApi.getAll();
      setPayments(response.data);
    } catch (error) {
      console.error('Error loading payments:', error);
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

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Thanh toán</h1>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Mã thanh toán</th>
                <th className="text-left py-3 px-4">Đơn hàng</th>
                <th className="text-left py-3 px-4">Số tiền</th>
                <th className="text-left py-3 px-4">Phương thức</th>
                <th className="text-left py-3 px-4">Trạng thái</th>
                <th className="text-left py-3 px-4">Ngày thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Không có thanh toán nào
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">
                      {payment.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">
                      {payment.orderId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {new Intl.NumberFormat('vi-VN').format(
                        payment.amount || 0,
                      )}{' '}
                      đ
                    </td>
                    <td className="py-3 px-4">{payment.method || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {payment.createdAt
                        ? format(
                            new Date(payment.createdAt),
                            'dd/MM/yyyy HH:mm',
                          )
                        : 'N/A'}
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

