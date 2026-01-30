import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCart } from "../context/CartContext";
import produtosData from "../produtos.json";

gsap.registerPlugin(ScrollTrigger);

// Card de produto elegante e minimalista
const ProductCard = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onNavigate,
  onAddToCart,
}) => {
  return (
    <div className="product-card group relative bg-neutral-900 border border-white/5 hover:border-gold/30 transition-all duration-500">
      {/* Badge de Desconto */}
      {product.discount > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-gold text-black text-[10px] font-bold px-2.5 py-1 tracking-wider">
          -{product.discount}%
        </div>
      )}

      {/* Favorito */}
      <button
        onClick={() => onToggleWishlist(product.productId)}
        className="absolute top-4 right-4 z-10 p-2 text-white/40 hover:text-red-400 transition-colors"
      >
        <Heart
          className={`w-4 h-4 ${
            isWishlisted ? "fill-red-500 text-red-500" : ""
          }`}
        />
      </button>

      {/* Imagem */}
      <div
        onClick={() => onNavigate(`/produto/${product.productId}`)}
        className="relative h-56 flex items-center justify-center cursor-pointer overflow-hidden bg-neutral-800/50"
      >
        <img
          src={product.img}
          alt={product.nome}
          className="h-44 w-auto object-contain transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        {/* Categoria */}
        <p className="text-[10px] uppercase text-gold/70 tracking-[0.2em] mb-2">
          {product.categoria}
        </p>

        {/* Nome */}
        <h3
          onClick={() => onNavigate(`/produto/${product.productId}`)}
          className="text-sm font-medium text-white mb-4 line-clamp-2 hover:text-gold transition-colors cursor-pointer leading-relaxed"
        >
          {product.nome}
        </h3>

        {/* Preço */}
        <div className="flex items-center gap-3 mb-5">
          {product.oldPrice && (
            <span className="text-xs text-white/30 line-through">
              {product.oldPrice}
            </span>
          )}
          <span className="text-lg font-semibold text-white">
            {product.preco}
          </span>
        </div>

        {/* Botão */}
        <button
          onClick={() => onAddToCart(product)}
          className="w-full py-3 bg-white/5 border border-white/10 text-white text-xs uppercase tracking-widest hover:bg-gold hover:border-gold hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Adicionar
        </button>
      </div>
    </div>
  );
};

const BestSellersSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = React.useState([]);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const gridRef = useRef(null);

  // Animações simples e elegantes
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Título
      gsap.fromTo(".bestseller-title",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
          },
        }
      );

      // Subtítulo
      gsap.fromTo(".bestseller-subtitle",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
          },
        }
      );

      // Cards com stagger simples
      gsap.fromTo(".product-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Produtos mais vendidos
  const bestSellers = [
    { categoryIndex: 1, productIndex: 0, discount: 15, oldPrice: "28.000kz" },
    { categoryIndex: 0, productIndex: 0, discount: 10, oldPrice: "30.000kz" },
    { categoryIndex: 2, productIndex: 1, discount: 20, oldPrice: "35.000kz" },
    { categoryIndex: 1, productIndex: 2, discount: 12, oldPrice: "26.000kz" },
    { categoryIndex: 3, productIndex: 0, discount: 18, oldPrice: "32.000kz" },
  ];

  const getProduct = (categoryIndex, productIndex) => {
    if (
      categoryIndex < 0 ||
      categoryIndex >= produtosData.length ||
      productIndex < 0 ||
      productIndex >= produtosData[categoryIndex].produtos.length
    ) {
      return null;
    }
    return {
      ...produtosData[categoryIndex].produtos[productIndex],
      categoria: produtosData[categoryIndex].categoria,
      categoryIndex,
      productIndex,
    };
  };

  const products = bestSellers
    .map((seller) => {
      const product = getProduct(seller.categoryIndex, seller.productIndex);
      if (!product) return null;
      return {
        ...product,
        discount: seller.discount,
        oldPrice: seller.oldPrice,
        productId: `${seller.categoryIndex}-${seller.productIndex}`,
      };
    })
    .filter(Boolean);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product) => {
    addToCart(
      {
        nome: product.nome,
        preco: product.preco,
        img: product.img,
        categoria: product.categoria,
        copy: product.copy,
      },
      1
    );
  };

  return (
    <section ref={sectionRef} className="bg-black py-28 relative">
      {/* Linha superior sutil */}
      <div className="absolute top-0 left-0 w-full h-px bg-white/5" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="bestseller-subtitle text-gold text-[11px] font-mono uppercase tracking-[0.3em] mb-4 block">
              Mais Procurados
            </span>
            <h2 className="bestseller-title text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">
              Best Sellers
            </h2>
          </div>
          
          <button
            onClick={() => navigate("/")}
            className="text-white/50 text-xs uppercase tracking-[0.2em] hover:text-gold transition-colors border-b border-white/20 hover:border-gold pb-1 self-start md:self-auto"
          >
            Ver Todos →
          </button>
        </div>

        {/* Grid Desktop */}
        <div ref={gridRef} className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              isWishlisted={wishlist.includes(product.productId)}
              onToggleWishlist={toggleWishlist}
              onNavigate={navigate}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {/* Mobile Scroll */}
        <div className="sm:hidden">
          <div className="overflow-x-auto -mx-6 px-6 pb-4 scrollbar-hide">
            <div className="flex gap-4">
              {products.map((product) => (
                <div key={product.productId} className="w-64 shrink-0">
                  <ProductCard
                    product={product}
                    isWishlisted={wishlist.includes(product.productId)}
                    onToggleWishlist={toggleWishlist}
                    onNavigate={navigate}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection;
