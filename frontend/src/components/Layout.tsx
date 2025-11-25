import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Warehouse,
  Tag,
  Truck,
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
  { path: '/inventory', label: 'Kho hàng', icon: Warehouse },
  { path: '/promotions', label: 'Khuyến mãi', icon: Tag },
  { path: '/suppliers', label: 'Nhà cung cấp', icon: Truck },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-primary-600 via-primary-700 to-primary-800 shadow-2xl z-10">
        <div className="p-6 border-b border-primary-500/30">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Quản lý Bán hàng
            </span>
          </h1>
        </div>
        <nav className="p-4 overflow-y-auto h-[calc(100vh-100px)]">
          <ul className="space-y-1">
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-white/20 text-white font-semibold shadow-lg backdrop-blur-sm'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/70'}`} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 min-h-screen">{children}</main>
    </div>
  );
}

