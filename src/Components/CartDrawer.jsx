import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const total = getTotalPrice();
  const formatted = new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(total);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("O seu carrinho está vazio!");
      return;
    }

    if (!user) {
      toast.info("Faça login para finalizar a compra.");
      setIsCartOpen(false);
      navigate("/login");
      return;
    }

    // Format WhatsApp Message
    const whatsappNumber = "244935354826";
    const userName = user.displayName || user.name || "Cliente";
    const userEmail = user.email || "Sem email";

    let message = `*Novo Pedido - Djay Cosmetics*\n\n`;
    message += `*Cliente:* ${userName}\n`;
    message += `*Email:* ${userEmail}\n\n`;
    message += `*Itens do Pedido:*\n`;

    cartItems.forEach((item) => {
      const itemPrice = item.preco ? item.preco : `${item.price} kz`;
      message += `▪ ${item.quantity}x ${item.nome || item.name} - ${itemPrice}\n`;
    });

    message += `\n*Total:* ${formatted}`;
    message += `\n\n------------------------------\n`;
    message += `Aguardo a confirmação do pedido.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    setIsCartOpen(false);
    toast.success("Redirecionando para o WhatsApp...");

    // Small delay to allow toast to be seen
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 1500);
  };

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
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md z-50 bg-white flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="bg-black/5 p-2 rounded-full">
                  <ShoppingBag className="w-5 h-5 text-black" />
                </div>
                <h2 className="text-xl font-bold text-black font-heading">
                  Seu Carrinho
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-900 text-lg font-bold mb-2">
                    O carrinho está vazio
                  </p>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Parece que você ainda não adicionou nenhum produto. Explore
                    nossa coleção!
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-8 px-6 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all"
                  >
                    Começar a Comprar
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-4 group"
                  >
                    {/* Imagem */}
                    <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                      {item.imageUrl || item.img ? (
                        <img
                          src={item.imageUrl || item.img}
                          alt={item.nome || item.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
                            {item.nome || item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-2 -mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.categoria || item.category}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        <p className="font-mono font-bold text-black">
                          {item.preco || item.price}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-black transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-black transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-xl font-bold text-black font-mono">
                    {formatted}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Finalizar Compra</span>
                  <span className="w-1 h-1 bg-white rounded-full mx-1" />
                  <span className="font-mono">{formatted}</span>
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
