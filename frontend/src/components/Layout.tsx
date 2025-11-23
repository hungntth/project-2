import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  UserCircle,
  Warehouse,
  CreditCard,
  Tag,
  Truck,
  BarChart3,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Sản phẩm', icon: Package },
  { path: '/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { path: '/customers', label: 'Khách hàng', icon: Users },
  { path: '/categories', label: 'Danh mục', icon: FolderTree },
  { path: '/employees', label: 'Nhân viên', icon: UserCircle },
  { path: '/inventory', label: 'Kho hàng', icon: Warehouse },
  { path: '/payments', label: 'Thanh toán', icon: CreditCard },
  { path: '/promotions', label: 'Khuyến mãi', icon: Tag },
  { path: '/suppliers', label: 'Nhà cung cấp', icon: Truck },
  { path: '/reports', label: 'Báo cáo', icon: BarChart3 },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600">
            Quản lý Bán hàng
          </h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard' &&
                  location.pathname.startsWith(item.path));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}

