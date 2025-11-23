import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await ordersApi.getById(id!);
      setOrder(response.data);
      setNewStatus(response.data.status);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) return;

    setStatusLoading(true);
    try {
      await ordersApi.updateStatus(id!, { status: newStatus });
      loadOrder();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(
        error.response?.data?.message ||
          'Có lỗi xảy ra khi cập nhật trạng thái',
      );
    } finally {
      setStatusLoading(false);
    }
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
        className={`px-3 py-1 rounded text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}
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

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        <button
          onClick={() => navigate('/orders')}
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
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">Đơn hàng #{order.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Chi tiết sản phẩm</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Sản phẩm</th>
                    <th className="text-left py-3 px-4">Số lượng</th>
                    <th className="text-left py-3 px-4">Đơn giá</th>
                    <th className="text-left py-3 px-4">Giảm giá</th>
                    <th className="text-left py-3 px-4">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any, index: number) => {
                    const itemTotal =
                      item.price * item.quantity - (item.discount || 0);
                    return (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">
                          {item.product?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">
                          {new Intl.NumberFormat('vi-VN').format(item.price)} đ
                        </td>
                        <td className="py-3 px-4">
                          {item.discount
                            ? new Intl.NumberFormat('vi-VN').format(
                                item.discount,
                              ) + ' đ'
                            : '-'}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {new Intl.NumberFormat('vi-VN').format(itemTotal)} đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td
                      colSpan={4}
                      className="py-3 px-4 text-right font-semibold"
                    >
                      Tổng cộng:
                    </td>
                    <td className="py-3 px-4 font-bold text-lg text-primary-600">
                      {new Intl.NumberFormat('vi-VN').format(
                        order.totalAmount || 0,
                      )}{' '}
                      đ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Mã đơn hàng</label>
                <p className="font-mono">{order.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Trạng thái</label>
                <div className="mt-2">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <label className="label">Cập nhật trạng thái</label>
                <div className="flex gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input flex-1"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={statusLoading || newStatus === order.status}
                    className="btn btn-primary"
                  >
                    {statusLoading ? '...' : 'Cập nhật'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Khách hàng</label>
                <p className="font-medium">{order.customer?.name || 'N/A'}</p>
                {order.customer?.email && (
                  <p className="text-sm text-gray-600">
                    {order.customer.email}
                  </p>
                )}
                {order.customer?.phone && (
                  <p className="text-sm text-gray-600">
                    {order.customer.phone}
                  </p>
                )}
              </div>
              {order.employee && (
                <div>
                  <label className="text-sm text-gray-600">Nhân viên</label>
                  <p className="font-medium">{order.employee.name}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600">Ngày tạo</label>
                <p>
                  {order.createdAt
                    ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')
                    : 'N/A'}
                </p>
              </div>
              {order.notes && (
                <div>
                  <label className="text-sm text-gray-600">Ghi chú</label>
                  <p>{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

