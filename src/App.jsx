import Home from "./Pages/Home";
import { Routes, Route } from "react-router-dom";
import Sign from "./Pages/Sign";
import ProductPage from "./components/ProductPage";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import CartDrawer from "./components/CartDrawer";
import PrivateRoute from "./routes/PrivateRoute";
import AdminPanel from "./components/AdminPanel";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CartDrawer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Sign />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route path="/produto/:id" element={<ProductPage />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
