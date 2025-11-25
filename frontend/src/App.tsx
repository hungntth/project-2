import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductCreate from './pages/ProductCreate';
import ProductEdit from './pages/ProductEdit';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import OrderCreate from './pages/OrderCreate';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import CustomerCreate from './pages/CustomerCreate';
import Categories from './pages/Categories';
import CategoryCreate from './pages/CategoryCreate';
import Inventory from './pages/Inventory';
import InventoryPeriod from './pages/InventoryPeriod';
import Payments from './pages/Payments';
import Promotions from './pages/Promotions';
import Suppliers from './pages/Suppliers';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Router>
        <Layout>
          <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Products Routes */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/create" element={<ProductCreate />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<ProductEdit />} />

          {/* Orders Routes */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/create" element={<OrderCreate />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          {/* Customers Routes */}
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/create" element={<CustomerCreate />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />

          {/* Categories Routes */}
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/create" element={<CategoryCreate />} />

          {/* Inventory Routes */}
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/period" element={<InventoryPeriod />} />

          {/* Payments Routes */}
          <Route path="/payments" element={<Payments />} />

          {/* Promotions Routes */}
          <Route path="/promotions" element={<Promotions />} />

          {/* Suppliers Routes */}
          <Route path="/suppliers" element={<Suppliers />} />
          </Routes>
        </Layout>
      </Router>
    </>
  );
}

export default App;

