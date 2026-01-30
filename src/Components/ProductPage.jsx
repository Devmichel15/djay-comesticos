import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Star, Plus, Minus, ShoppingBag, ChevronDown, Check } from "lucide-react";
import produtosData from "../produtos.json";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import RelatedProducts from "./RelatedProducts";
import { toast } from "react-toastify";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [quantity, setQuantity] = React.useState(1);
  const [expandedSection, setExpandedSection] = React.useState(null);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [addedSuccess, setAddedSuccess] = React.useState(false);

  // Encontrar produto pela categoria e índice
  const [product, setProduct] = React.useState(null);
  const [category, setCategory] = React.useState(null);

  React.useEffect(() => {
    const [catIndex, prodIndex] = id.split("-").map(Number);
    if (catIndex >= 0 && catIndex < produtosData.length) {
      const cat = produtosData[catIndex];
      if (prodIndex >= 0 && prodIndex < cat.produtos.length) {
        setProduct(cat.produtos[prodIndex]);
        setCategory(cat.categoria);
      }
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (!product || !category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Produto não encontrado</p>
      </div>
    );
  }

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user?.uid) {
      toast.warning("Por favor, faça login para adicionar ao carrinho");
      navigate("/sign");
      return;
    }

    setIsAddingToCart(true);
    
    try {
      await addToCart({ ...product, categoria: category }, quantity);
      
      // Show success feedback
      setAddedSuccess(true);
      toast.success(`${quantity}x ${product.nome} adicionado ao carrinho!`);
      
      // Reset state
      setQuantity(1);
      
      // Reset success feedback after 2 seconds
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast.error("Erro ao adicionar ao carrinho. Tente novamente.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const sections = [
    {
      title: "Características",
      content: [
        "Formulação avançada e inovadora",
        "Testado dermatologicamente",
        "Longa duração comprovada",
        "Acabamento profissional",
        "Seguro para peles sensíveis",
      ],
    },
    {
      title: "Como Usar",
      content: [
        "1. Aplicar uma pequena quantidade no rosto limpo",
        "2. Espalhar uniformemente com as mãos ou pincéis",
        "3. Aguardar alguns segundos até fixar",
        "4. Remover com água ou desmaquilhante no final do dia",
      ],
    },
    {
      title: "Ingredientes",
      content: [
        "Aqua (água)",
        "Talc (talco)",
        "Mica (mica)",
        "Titanium Dioxide (dióxido de titânio)",
        "Magnesium Stearate (estearato de magnésio)",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Breadcrumb - Responsivo */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
          <button
            onClick={() => navigate("/")}
            className="whitespace-nowrap hover:text-black transition-colors"
          >
            Home
          </button>
          <span className="text-gray-300">/</span>
          <span className="whitespace-nowrap text-gray-400">{category}</span>
          <span className="text-gray-300">/</span>
          <span className="whitespace-nowrap text-gray-900 font-medium truncate">{product.nome}</span>
        </div>
      </div>

      {/* Product Section - Mobile First */}
      <div className="flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:gap-12 mb-12 lg:mb-20"
          >
            {/* Imagem - Responsiva */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2 flex items-center justify-center mb-8 lg:mb-0"
            >
              <div className="w-full max-w-sm lg:max-w-none bg-linear-to-br from-gray-100 to-gray-200 rounded-xl lg:rounded-2xl aspect-square relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={product.img}
                  alt={product.nome}
                  className="w-full h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-700 p-4 lg:p-6"
                />
              </div>
            </motion.div>

            {/* Info - Responsiva */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2 flex flex-col justify-start"
            >
              {/* Category Badge */}
              <div className="inline-flex items-center w-fit mb-3 lg:mb-4">
                <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                  {category}
                </span>
              </div>

              {/* Title - Responsivo */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4 leading-tight">
                {product.nome}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600">(128 avaliações)</span>
              </div>

              {/* Preço - Responsivo */}
              <div className="mb-6 lg:mb-8">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  Preço
                </p>
                <p className="text-4xl sm:text-5xl lg:text-5xl font-bold text-gray-900">{product.preco}</p>
                <p className="text-sm text-green-600 mt-2">✓ Em Stock</p>
              </div>

              {/* Descrição - Responsiva */}
              <p className="text-base sm:text-lg text-gray-700 mb-6 lg:mb-8 leading-relaxed">
                {product.copy}
              </p>

              {/* Quantity & Add to Cart - Mobile Optimized */}
              <div className="flex flex-col gap-3 mb-8 lg:mb-8">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-lg h-12 sm:h-14 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="shrink-0 px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center font-semibold text-base sm:text-lg outline-none bg-transparent"
                    min="1"
                    aria-label="Quantidade"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="shrink-0 px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Add to Cart Button - Full Width Mobile, Auto Desktop */}
                <motion.button
                  whileHover={{ scale: addedSuccess ? 1 : 1.02 }}
                  whileTap={{ scale: addedSuccess ? 1 : 0.98 }}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || addedSuccess}
                  className={`w-full lg:w-auto px-6 sm:px-8 h-12 sm:h-14 font-semibold text-base sm:text-lg rounded-lg flex items-center justify-center gap-2 group transition-all duration-500 ${
                    addedSuccess
                      ? "bg-green-600 text-white"
                      : "bg-black text-white hover:bg-gray-900 active:bg-gray-800"
                  } ${isAddingToCart ? "opacity-70 cursor-not-allowed" : ""}`}
                  aria-label="Adicionar ao carrinho"
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                      <span>Adicionado!</span>
                    </>
                  ) : isAddingToCart ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Adicionando...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                      <span>Adicionar ao Carrinho</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Trust Signals - Responsivo */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Envio grátis para compras acima de 5.000kz</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Garantia de satisfação ou devolução</span>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Produtos 100% originais certificados</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Expandable Sections - Responsivo */}
          <div className="mb-12 lg:mb-20 border-t border-gray-200 pt-8 lg:pt-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Informações do Produto
            </h2>
            <div className="space-y-3">
              {sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedSection(expandedSection === idx ? null : idx)
                    }
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    aria-expanded={expandedSection === idx}
                  >
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                      {section.title}
                    </h3>
                    <motion.div
                      animate={{
                        rotate: expandedSection === idx ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    </motion.div>
                  </button>

                  {expandedSection === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200"
                    >
                      <ul className="space-y-2">
                        {section.content.map((item, i) => (
                          <li key={i} className="text-gray-700 text-sm sm:text-base flex items-start gap-3">
                            <span className="text-gold font-bold mt-0.5 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Relacionados */}
      <RelatedProducts
        currentProduct={product}
        categoryName={category}
        categoryIndex={parseInt(id.split("-")[0])}
      />
    </div>
  );
};

export default ProductPage;
