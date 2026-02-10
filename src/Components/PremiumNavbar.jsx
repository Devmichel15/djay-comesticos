import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, X, User, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { searchProducts } from "../utils/searchUtils";

const PremiumNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { getTotalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const cartCount = getTotalItems();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const results = searchProducts(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      // Navigate to the first result if enter is pressed, or just keep results open
      // For now, let's just keep the results open for the user to pick
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <>
      {/* Top Info Bar */}
      <div className="hidden md:block fixed top-0 w-full z-50 bg-black text-white text-xs text-center py-2 tracking-wide font-medium">
        Envio e Devoluções gratuitos — Entrega em 24h em Luanda
      </div>

      <motion.header
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed w-full z-40 transition-all duration-500 ${
          isScrolled
            ? "top-0 md:top-8 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm py-2"
            : "top-0 md:top-8 bg-transparent border-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center z-50">
            <h1
              className={`font-heading text-2xl md:text-3xl tracking-tight transition-colors duration-300 ${isScrolled ? "text-black" : "text-black md:text-white"}`}
            >
              DJAY<span className="text-gold">.</span>
            </h1>
          </Link>

          {/* Center: Search Bar */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md hidden md:block">
            <div
              className={`relative group transition-all duration-300 ${isSearchOpen ? "scale-105" : "scale-100"}`}
            >
              <div
                className={`flex items-center bg-white/10 border ${isScrolled ? "border-gray-200 bg-gray-100/50" : "border-white/20 bg-white/10 text-white"} rounded-full px-4 py-2 backdrop-blur-md focus-within:bg-white focus-within:border-gray-300 focus-within:text-black focus-within:shadow-lg transition-all duration-300`}
              >
                <Search
                  className={`w-4 h-4 ${isScrolled ? "text-gray-500" : "text-gray-300 group-focus-within:text-gray-500"} mr-3`}
                />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  className={`bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 font-medium ${isScrolled ? "text-black" : "text-white/90 focus:text-black"}`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isSearchOpen) setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchOpen && searchQuery.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2"
                  >
                    {searchResults.length > 0 ? (
                      <>
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Produtos
                        </div>
                        {searchResults.slice(0, 5).map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              navigate(`/produto/${product.id}`);
                              closeSearch();
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden shrink-0">
                              {product.img ? (
                                <img
                                  src={product.img}
                                  alt={product.nome}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 line-clamp-1">
                                {product.nome}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.categoria}
                              </p>
                            </div>
                          </div>
                        ))}
                        {searchResults.length > 5 && (
                          <div className="px-4 py-2 text-center border-t border-gray-100">
                            <span className="text-xs font-bold text-black cursor-pointer hover:underline">
                              Ver todos os {searchResults.length} resultados
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        Nenhum produto encontrado.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4 md:space-x-6 z-50">
            {/* Mobile Search Toggle */}
            <button
              className="md:hidden text-current p-2"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search
                className={`w-6 h-6 ${isScrolled ? "text-black" : "text-white"}`}
              />
            </button>

            {isAdmin ? (
              <Link
                to="/admin"
                className={`hidden md:flex items-center gap-2 hover:text-gold transition ${isScrolled ? "text-black" : "text-white"}`}
              >
                <User className="w-6 h-6" />
                <span className="text-xs font-mono uppercase tracking-wider">
                  Admin
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className={`hidden md:block hover:text-gold transition ${isScrolled ? "text-black" : "text-white"}`}
              >
                <User className="w-6 h-6" />
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative hover:text-gold transition ${isScrolled ? "text-black" : "text-white"}`}
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold text-black text-[10px] flex items-center justify-center font-bold"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg p-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-gray-100 text-black rounded-lg py-3 pl-10 pr-4 outline-none text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Mobile Search Results */}
              {searchQuery.length > 1 && (
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            navigate(`/produto/${product.id}`);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                            {product.img ? (
                              <img
                                src={product.img}
                                alt={product.nome}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {product.nome}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.categoria}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-500 py-4">
                      Sem resultados.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default PremiumNavbar;
