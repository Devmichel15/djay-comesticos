import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAppwrite } from "../hooks/useAppwrite";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.2, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5 },
  },
  hover: {
    scale: 1.06,
    transition: { duration: 0.3 },
  },
};

function Products() {
  const navigate = useNavigate();
  const { fetchAllProducts } = useAppwrite();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const loadFeatured = async () => {
      const all = await fetchAllProducts();
      if (all && all.length > 0) {
        // Pick one product per category for highlight
        const categories = [...new Set(all.map((p) => p.category))];
        const selected = [];
        categories.slice(0, 4).forEach((cat) => {
          const prod = all.find((p) => p.category === cat);
          if (prod) selected.push(prod);
        });
        setFeaturedProducts(selected);
      }
    };
    loadFeatured();
  }, []);

  if (!featuredProducts.length) return null;

  return (
    <section className="px-8 py-20 bg-linear-to-b from-white via-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-16 text-black">
        Destaques Djay Cosméticos
      </h1>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {featuredProducts.map((produto, index) => {
          return (
            <motion.div
              key={produto.id || index}
              className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer flex flex-col"
              variants={cardVariants}
              whileHover="hover"
            >
              {/* Imagem */}
              <div
                className="relative h-60 bg-linear-to-tr from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center overflow-hidden"
                onClick={() => navigate(`/produto/${produto.id}`)}
              >
                {produto.image_url || produto.imageUrl ? (
                  <img
                    src={produto.image_url || produto.imageUrl}
                    alt={produto.name}
                    className="object-contain h-full transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <span className="text-gray-300 text-sm">
                    Imagem não disponível
                  </span>
                )}

                <span className="absolute top-4 right-4 bg-linear-to-br from-yellow-400 to-yellow-600 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  Destaque
                </span>
              </div>

              {/* Conteúdo */}
              <div className="p-6 flex flex-col flex-1">
                <span className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                  {produto.category}
                </span>

                <h3
                  className="text-lg font-mono font-semibold text-black mb-3 hover:text-yellow-600 transition-colors"
                  onClick={() => navigate(`/produto/${produto.id}`)}
                >
                  {produto.name}
                </h3>

                <p className="text-sm text-gray-700 mb-6 leading-relaxed line-clamp-3">
                  {produto.description}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <span className="font-mono text-lg font-semibold text-black">
                    {Number(produto.price).toLocaleString("pt-AO", {
                      style: "currency",
                      currency: "AOA",
                    })}
                  </span>

                  <button
                    onClick={() => navigate(`/produto/${produto.id}`)}
                    className="bg-linear-to-r from-yellow-500 to-yellow-600 text-black px-6 py-2 rounded-full font-mono font-semibold shadow-md hover:from-yellow-600 hover:to-yellow-700 transition-all"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

export default Products;
