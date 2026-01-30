import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useCart } from "../context/CartContext";

const PremiumNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalItems, setIsCartOpen } = useCart();
  const cartCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Produtos", path: "/produtos" },
    { name: "Novidades", path: "/novidades" },
    { name: "Promoções", path: "/promocoes" },
    { name: "Contato", path: "/contato" },
  ];

  return (
    <>
      {/* Top Info Bar */}
      <div className="hidden md:block fixed top-0 w-full z-50 bg-black text-white text-xs text-center py-2 tracking-wide">
        Envio rápido em Luanda • Produtos 100% originais
      </div>

      <motion.header
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed w-full z-40 transition-all duration-500 border-b ${
          isScrolled
            ? "top-0 md:top-6 bg-black/90 backdrop-blur-lg border-white/10"
            : "top-0 md:top-6 bg-transparent border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1
              alt="Djay Cosméticos"
              className={`object-contain transition-all duration-300 px-2 py-1 text-white font-heading text-lg md:text-2xl`}
              
            >DJAY<span className="text-gold">.</span></h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-xs font-medium tracking-[0.2em] uppercase text-white/80 hover:text-white relative group"
              >
                {link.name}
                <span className="absolute -bottom-2 left-0 w-full h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            <Link to="/login" className="text-white hover:text-gold transition">
              <User className="w-5 h-5" />
            </Link>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-white hover:text-gold transition"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold text-black text-xs flex items-center justify-center font-bold"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white hover:text-gold"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center py-20 space-y-8"
          >
            <button
              className="absolute top-6 right-6 text-white hover:text-gold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>

            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Link
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-heading text-2xl md:text-3xl text-white hover:text-gold transition"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PremiumNavbar;
