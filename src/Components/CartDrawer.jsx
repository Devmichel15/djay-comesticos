import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart as useCartContext } from "../context/CartContext";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity: ctxUpdateQuantity, removeFromCart: ctxRemoveFromCart, getTotalPrice } = useCartContext();
  const { addToCart, removeFromCart, updateQuantity, getTotal, checkout } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const total = getTotalPrice();
  const formatted = new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(total);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md z-50 bg-white flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-6 h-6 text-black" />
                <h2 className="text-2xl font-bold text-black">Carrinho</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 text-lg font-medium">
                    O seu carrinho está vazio
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Adicione produtos para começar
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    exit={{ opacity: 0, x: 100 }}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    {/* Imagem */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={item.img}
                        alt={item.nome}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {item.nome}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">{item.categoria}</p>
                      <p className="text-sm font-bold text-gray-900 mt-2">
                        {item.preco}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3 border border-gray-300 rounded-lg w-fit">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-sm font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors self-start"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatted}
                  </span>
                </div>

                {/* Shipping Info */}
                <p className="text-xs text-gray-600 text-center">
                  Envio calculado na finalização
                </p>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    try {
                      // Persist current cart from context to localStorage so checkout flow can consume it
                      localStorage.setItem("cart", JSON.stringify(cartItems));
                      const ready = checkout();
                      if (!ready) {
                        // Not authenticated -> navigate to login
                        navigate('/login', { state: { from: '/' } });
                        setIsCartOpen(false);
                      }
                      // If ready === true, AuthContext will handle pendingCheckout redirect
                    } catch (err) {
                      alert(err.message || 'Erro ao finalizar compra');
                    }
                  }}
                  className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Finalizar Compra
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full border border-gray-300 text-gray-900 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Continuar Comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
