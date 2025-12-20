import React, { useState } from "react";
import { FaSearch, FaBars, FaShoppingCart, FaUser } from "react-icons/fa";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = 2; // depois isso vem do estado/global

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white text-grayDark border-b border-goldSoft">
      
      {/* Top info bar (opcional, mas premium) */}
      <div className="hidden md:block text-center text-xs py-2 bg-grayLight bg-black text-white">
        Envio rápido em Luanda • Produtos 100% originais
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between py-3 md:py-4 px-4">
        
        {/* Logo */}
        <img
          src="/logoCliente.jpeg"
          alt="Djay Cosméticos"
          className="h-16 md:h-14 lg:h-16 object-contain"
        />

        {/* Busca desktop */}
        <div className="flex-1 hidden md:flex justify-center">
          <div className="w-10/12 relative">
            <input
              type="text"
              placeholder="O que deseja procurar?"
              className="w-full h-11 rounded-full border border-neutral-300 px-5 pr-12 text-sm focus:outline-none focus:border-yellow-600"
            />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" />
          </div>
        </div>

        {/* Ícones */}
        <div className="flex items-center gap-4">
          
          {/* Conta (desktop) */}
          <button className="hidden md:flex items-center gap-2 text-sm hover:text-gold transition cursor-pointer">
            <FaUser fontSize={20}/>
          </button>

          {/* Carrinho */}
          <button className="relative hover:text-gold transition mr-7 cursor-pointer">
            <FaShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Menu mobile */}
          <button
            onClick={toggleMenu}
            className="md:hidden w-10 h-10 flex items-center justify-center"
            aria-label="Abrir menu"
          >
            <FaBars size={20} />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t border-goldSoft px-4 py-4">
          
          {/* Busca mobile */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="O que deseja procurar?"
                className="w-full h-11 rounded-full border border-goldSoft px-5 pr-12 text-sm focus:outline-none"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-grayDark" />
            </div>
          </div>

          <ul className="flex flex-col gap-4 text-sm font-medium">
            <li onClick={closeMenu}>Novidades</li>
            <li onClick={closeMenu}>Produtos</li>
            <li onClick={closeMenu}>Promoções</li>
            <li className="flex items-center gap-2">
              <FaUser /> Minha conta
            </li>
          </ul>
        </nav>
      )}

      {/* Menu desktop */}
      <div className="hidden md:block border-t border-goldSoft">
        <nav className="max-w-7xl mx-auto px-4">
          <ul className="flex justify-center gap-8 text-sm font-medium py-3">
            <li className="hover:text-gold transition">Novidades</li>
            <li className="hover:text-gold transition">Acessórios</li>
            <li className="hover:text-gold transition">Promoções</li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
