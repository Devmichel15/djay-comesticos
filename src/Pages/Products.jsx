import React, { useEffect, useState } from "react";
import { useAppwrite } from "../hooks/useAppwrite";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PremiumNavbar from "../components/PremiumNavbar";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

const Products = () => {
  const { products, fetchAllProducts, loading, error } = useAppwrite();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Todos");

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const categories = ["Todos", ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    filter === "Todos"
      ? products
      : products.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
      <PremiumNavbar />

      <div className="pt-32 pb-20 container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Nossa <span className="text-gold">Coleção</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto font-sans text-lg">
            Explore nossa linha exclusiva de cosméticos premium, desenvolvida
            para realçar sua beleza natural.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full font-mono text-sm transition-all border border-white/10 ${
                filter === cat
                  ? "bg-gold text-black border-gold"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <Link
                  to={`/produto/${product.id}`}
                  className="block overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 group-hover:border-gold/50 transition-colors"
                >
                  {/* Image - Responsive Height */}
                  <div className="w-full h-[180px] md:h-[250px] relative bg-white/5 flex items-center justify-center p-[10px]">
                    {(product.image_url || product.imageUrl) && (
                      <img
                        src={product.image_url || product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent double event
                        addToCart(product);
                      }}
                      className="absolute bottom-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-gold hover:text-black hover:border-gold transition-all translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </Link>

                <div className="mt-4">
                  <p className="text-white/50 text-xs font-mono mb-1">
                    {product.category}
                  </p>
                  <Link to={`/produto/${product.id}`}>
                    <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gold font-mono mt-1">
                    {Number(product.price).toLocaleString("pt-AO", {
                      style: "currency",
                      currency: "AOA",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
