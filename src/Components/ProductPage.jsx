import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Plus,
  Minus,
  ShoppingBag,
  ChevronDown,
  Check,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import dataService from "../appwrite/appwrite.database";
import PremiumNavbar from "./PremiumNavbar"; // Assuming we want navbar here too? Or App layout handles it?
// App.jsx has Navbar inside Home, but ProductPage is standalone. Ideally it should have a Navbar.
// The previous file didn't seem to import it, but let's check imports.
// Previous file: import PremiumNavbar was NOT there.
// But Products.jsx had it.
// Detailed view should probably have it. I'll add it if safely possible, or stick to previous layout.
// Previous layout had a "Breadcrumb" bar. I will stick to that to minimize visual changes unless requested.

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // id is now the Appwrite Document ID
        const doc = await dataService.getProduct(id);
        setProduct(doc);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Produto não encontrado");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <p className="text-xl text-gray-600 mb-4">
          {error || "Produto não encontrado"}
        </p>
        <button
          onClick={() => navigate("/produtos")}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
        >
          Voltar para Produtos
        </button>
      </div>
    );
  }

  // Derived fields from Appwrite structure
  // Migration mapped: nome->name, categoria->category, preco->price, img->image_url, copy->description
  const productName = product.name;
  const productCategory = product.category;
  const productPrice = product.price;
  const productImage = product.image_url || product.imageUrl; // Fallback
  const productDescription = product.description;

  const handleAddToCart = async (e) => {
    // Stop propagation just in case
    e?.stopPropagation();

    if (!user?.$id && !user?.uid) {
      toast.warning("Por favor, faça login para adicionar ao carrinho");
      navigate("/login"); // Fixed route
      return;
    }

    setIsAddingToCart(true);

    try {
      // Add to cart expects product object.
      // We should pass the Appwrite doc structure or a standardized one.
      // CartContext uses: nome, categoria, price/preco, id
      // Let's standardize the object passed to cart to match what CartContext expects or update CartContext?
      // CartContext: `item.nome === product.nome`
      // This implies CartContext expects `nome`.
      // BUT we migrated to `name`.
      // I should pass an object that matches what CartContext expects for now to avoid breaking Cart,
      // OR update CartContext to use `name`.
      // Given the "Fix Cart Bug" task, I should probably standardize CartContext to use `id` for identification instead of name+cat.
      // But for now, to be safe and fix this specific page:
      const cartItem = {
        ...product,
        nome: productName, // Backward compat for valid CartContext matching
        categoria: productCategory,
        preco: productPrice, // CartContext might check preco
        price: productPrice,
        image_url: productImage,
        imageUrl: productImage,
      };

      await addToCart(cartItem, quantity);

      setAddedSuccess(true);
      toast.success(`${quantity}x ${productName} adicionado ao carrinho!`);
      setQuantity(1);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast.error("Erro ao adicionar ao carrinho.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const sections = [
    {
      title: "Características",
      content: [
        "Formulação Premium",
        "Testado dermatologicamente",
        "Acabamento Profissional",
        "Longa Duração",
      ],
    },
    {
      title: "Descrição Detalhada",
      content: [productDescription], // Wrap in array to match map
    },
  ];

  const formatPrice = (val) => {
    return Number(val).toLocaleString("pt-AO", {
      style: "currency",
      currency: "AOA",
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
          <button
            onClick={() => navigate("/")}
            className="whitespace-nowrap hover:text-black transition-colors"
          >
            Home
          </button>
          <span className="text-gray-300">/</span>
          <button
            onClick={() => navigate("/produtos")}
            className="whitespace-nowrap hover:text-black transition-colors"
          >
            Produtos
          </button>
          <span className="text-gray-300">/</span>
          <span className="whitespace-nowrap text-gray-400">
            {productCategory}
          </span>
          <span className="text-gray-300">/</span>
          <span className="whitespace-nowrap text-gray-900 font-medium truncate">
            {productName}
          </span>
        </div>
      </div>

      {/* Product Section */}
      <div className="flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:gap-12 mb-12 lg:mb-20"
          >
            {/* Image Section - FIX UI BUG HERE */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2 flex items-center justify-center mb-8 lg:mb-0"
            >
              <div className="w-full max-w-lg bg-gray-100 rounded-2xl overflow-hidden relative group border border-gray-200 h-[500px] flex items-center justify-center p-4">
                {/* Applied requested CSS principles via Tailwind + Style */}
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2 flex flex-col justify-start"
            >
              <div className="inline-flex items-center w-fit mb-3 lg:mb-4">
                <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold px-2 py-1 bg-gray-100 rounded">
                  {productCategory}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4 leading-tight">
                {productName}
              </h1>

              <div className="flex items-center space-x-2 mb-6">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600">
                  (Avaliações)
                </span>
              </div>

              <div className="mb-6 lg:mb-8">
                <p className="text-4xl sm:text-5xl font-bold text-gray-900">
                  {formatPrice(productPrice)}
                </p>
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Em Stock
                </p>
              </div>

              <p className="text-base sm:text-lg text-gray-700 mb-6 lg:mb-8 leading-relaxed">
                {productDescription}
              </p>

              {/* Add to Cart */}
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center border border-gray-300 rounded-lg h-12 w-fit bg-white mb-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || addedSuccess}
                  className={`w-full lg:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    addedSuccess
                      ? "bg-green-600 text-white"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5" /> Adicionado!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" /> Adicionar ao Carrinho
                    </>
                  )}
                </motion.button>
              </div>

              {/* Accordion Sections */}
              <div className="border-t border-gray-200 pt-6">
                {sections.map((section, idx) => (
                  <div key={idx} className="border-b border-gray-200">
                    <button
                      onClick={() =>
                        setExpandedSection(expandedSection === idx ? null : idx)
                      }
                      className="w-full py-4 flex justify-between items-center text-left"
                    >
                      <span className="font-semibold text-gray-900">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${expandedSection === idx ? "rotate-180" : ""}`}
                      />
                    </button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedSection === idx ? "auto" : 0,
                        opacity: expandedSection === idx ? 1 : 0,
                      }}
                      className="overflow-hidden"
                    >
                      <ul className="pb-4 list-disc list-inside text-gray-600">
                        {section.content.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
