import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { useAppwrite } from "../hooks/useAppwrite";
import { useCart } from "../context/CartContext";

const RelatedProducts = ({ category, currentProductId }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { fetchAllProducts } = useAppwrite();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const loadRelated = async () => {
      if (!category) return;
      const all = await fetchAllProducts();
      // Filter by category and exclude current
      const related = all
        .filter((p) => p.category === category && p.id !== currentProductId)
        .slice(0, 4);
      setRelatedProducts(related);
    };
    loadRelated();
  }, [category, currentProductId]);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="bg-linear-to-b from-gray-50 to-white py-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Produtos Relacionados
          </h2>
          <p className="text-gray-600">
            Outros produtos da categoria {category}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {relatedProducts.map((product, idx) => {
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredId(product.id)}
                onHoverEnd={() => setHoveredId(null)}
                className="group"
              >
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  {/* Imagem */}
                  <div
                    onClick={() => navigate(`/produto/${product.id}`)}
                    className="relative overflow-hidden bg-gray-100 h-[250px] cursor-pointer flex items-center justify-center p-[10px]"
                  >
                    <img
                      src={product.image_url || product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Badge de categoria */}
                    <div className="absolute top-3 right-3 bg-gold text-black text-xs font-bold px-3 py-1 rounded-full">
                      {product.category}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3
                      onClick={() => navigate(`/produto/${product.id}`)}
                      className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 hover:text-gold transition-colors cursor-pointer"
                    >
                      {product.name}
                    </h3>

                    <p className="text-xs text-gray-600 mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    {/* Preço */}
                    <p className="text-lg font-bold text-gray-900 mb-4">
                      {Number(product.price).toLocaleString("pt-AO", {
                        style: "currency",
                        currency: "AOA",
                      })}
                    </p>

                    {/* Botões */}
                    <div className="space-y-3 mt-auto">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/produto/${product.id}`)}
                        className="w-full py-2.5 border border-black text-black font-medium rounded-lg hover:bg-black hover:text-white transition-colors text-sm"
                      >
                        Ver Detalhes
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          addToCart(
                            {
                              ...product,
                              nome: product.name,
                              categoria: product.category,
                              price: product.price,
                            },
                            1,
                          )
                        }
                        className="w-full py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2 text-sm"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Adicionar</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default RelatedProducts;
