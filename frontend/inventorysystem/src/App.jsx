import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductsPage from "./pages/ProductsPage";
import ProductCreatePage from "./pages/ProductCreatePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductEditPage from "./pages/ProductEditPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import SalesPage from "./pages/SalesPage";
import SaleDetailsPage from "./pages/SaleDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import InventoryAdjustmentsPage from "./pages/InventoryAdjustmentsPage";
import UsersPage from "./pages/UsersPage";
import AuditLogPage from "./pages/AuditLogPage";

const App = () => (
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/:id" element={<SaleDetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        {/* <Route path="/inventory-adjustments" element={<InventoryAdjustmentsPage />} /> */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<ProductCreatePage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/products/:id/edit" element={<ProductEditPage />} />
        <Route path="/users" element={<ProtectedRoute roles={["admin"]} />}> <Route index element={<UsersPage />} /> </Route>
        <Route path="/audit-logs" element={<ProtectedRoute roles={["admin"]} />}> <Route index element={<AuditLogPage />} /> </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;