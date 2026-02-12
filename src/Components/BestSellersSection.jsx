import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCart } from "../context/CartContext";
import { useAppwrite } from "../hooks/useAppwrite";

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
        onClick={() => onToggleWishlist(product.id)}
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
        onClick={() => onNavigate(`/produto/${product.id}`)}
        className="relative h-56 flex items-center justify-center cursor-pointer overflow-hidden bg-neutral-800/50"
      >
        <img
          src={product.imageUrl || product.img} // Fallback for legacy naming
          alt={product.name}
          className="h-44 w-auto object-contain transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        {/* Categoria */}
        <p className="text-[10px] uppercase text-gold/70 tracking-[0.2em] mb-2">
          {product.category}
        </p>

        {/* Nome */}
        <h3
          onClick={() => onNavigate(`/produto/${product.id}`)}
          className="text-sm font-medium text-white mb-4 line-clamp-2 hover:text-gold transition-colors cursor-pointer leading-relaxed"
        >
          {product.name}
        </h3>

        {/* Preço */}
        <div className="flex items-center gap-3 mb-5">
          {product.oldPrice && (
            <span className="text-xs text-white/30 line-through">
              {product.oldPrice}
            </span>
          )}
          <span className="text-lg font-semibold text-white">
            {typeof product.price === "number"
              ? `${product.price.toLocaleString()} kz`
              : product.price}
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
  const { fetchAllProducts, loading } = useAppwrite();
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await fetchAllProducts();
        // Simulate "Best Sellers" by taking first 5 or random 5
        // For now, just take first 5
        if (allProducts && allProducts.length > 0) {
          setProducts(allProducts.slice(0, 5));
        }
      } catch (e) {
        console.error("Failed to load best sellers", e);
      }
    };
    loadProducts();
  }, []);

  // Animações simples e elegantes (run when products change)
  useEffect(() => {
    if (products.length === 0) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Título
        gsap.fromTo(
          ".bestseller-title",
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
          },
        );

        // Subtítulo
        gsap.fromTo(
          ".bestseller-subtitle",
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
          },
        );

        // Cards com stagger simples
        gsap.fromTo(
          ".product-card",
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
          },
        );
      }, sectionRef);

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, [products]);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleAddToCart = (product) => {
    // Adapter for cart structure if needed
    addToCart(
      {
        nome: product.name, // Cart expects 'nome' ? fallback to name
        price: product.price,
        img: product.imageUrl,
        categoria: product.category,
        description: product.description,
        ...product,
      },
      1,
    );
  };

  return (
    <section ref={sectionRef} className="bg-black py-28 relative">
      {/* Linha superior sutil */}
      <div className="absolute top-0 left-0 w-full h-px bg-white/5" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          ref={titleRef}
          className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <span className="bestseller-subtitle text-gold text-[11px] font-mono uppercase tracking-[0.3em] mb-4 block">
              Mais Procurados
            </span>
            <h2 className="bestseller-title text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">
              Best Sellers
            </h2>
          </div>

          <button
            onClick={() => navigate("/produtos")} // Assuming /produtos exists or will exist
            className="text-white/50 text-xs uppercase tracking-[0.2em] hover:text-gold transition-colors border-b border-white/20 hover:border-gold pb-1 self-start md:self-auto"
          >
            Ver Todos →
          </button>
        </div>

        {/* Grid Responsive */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5"
        >
          {loading && products.length === 0 ? (
            <div className="col-span-full text-center text-white/50 py-10">
              Carregando produtos...
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center text-white/30 py-10">
              Nenhum produto em destaque no momento.
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={toggleWishlist}
                onNavigate={navigate}
                onAddToCart={handleAddToCart}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection;
