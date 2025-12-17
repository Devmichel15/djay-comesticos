import { useState } from "react";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";

function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  return (

  <header className="flex w-full px-2 border-b border-b-black md:flex-row flex-col">
    {/* Logo and Mobile Buttons */}
    <div className="flex items-center justify-between w-full md:w-auto">
      <img
        src="/logoCliente.jpeg"
        alt="Logo da Marca"
        className="w-52 h-28 rounded-2xl object-center object-cover"
      />

      <div className="flex md:hidden gap-3">
        <button onClick={() => setOpenSearch(!openSearch)}>
          <FaSearch size={20} />
        </button>
        <button onClick={() => setOpenMenu(!openMenu)}>
          {openMenu ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>
    </div>

    <div className=" flex-col-reverse justify-around items-center w-full p-2 hidden md:flex">
      {/* Search */}
      <div className="w-full flex justify-center">
        <div className="relative w-2/3">
          <input
            type="text"
            placeholder="O seu produto favorito"
            className="w-full bg-gray-100 py-2 pl-4 pr-10 rounded-2xl outline-[#fae07d]"
          />
          <FaSearch
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-[#fae07d] transition-all duration-300 ease-in-out"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="w-full flex justify-center items-center">
        <a
          href="#"
          className="mr-4 hover:underline hover:text-[#e2d394] transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
        >
          Início
        </a>
        <a
          href="#"
          className="mr-4 hover:underline hover:text-[#e2d394] transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
        >
          Produtos
        </a>
        <a
          href="#"
          className="mr-4 hover:underline hover:text-[#e2d394] transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
        >
          Contacto
        </a>
        <a
          href="#"
          className="mr-4 hover:underline hover:text-[#e2d394] transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
        >
          Carrinho
        </a>
      </nav>
    </div>

    {/* Mobile Search */}
    {openSearch && (
      <div className=" w-full mt-2 flex justify-center">
        <div className="relative w-2/3">
          <input
            type="text"
            placeholder="O seu produto favorito"
            className="w-full bg-gray-100 py-2 pl-4 pr-10 rounded-2xl outline-[#fae07d]"
          />
          <FaSearch
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
          />
        </div>
      </div>
    )}

    {/* Mobile Menu */}
    {openMenu && (
      <nav className=" w-full flex flex-col items-center gap-3 mt-2 md:hidden">
        <a
          href="#"
          className="mr-4 hover:underline hover:text-[#e2d394] transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
        >
          Início
        </a>
        <a
          href="#"
          className="mr-4 hover:underline hover:text-[#e2d394] transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
        >
          Produtos
        </a>
        <a
          href="#"
          className="mr-4 hover:underline hover:text-[#e2d394] transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
        >
          Contacto
        </a>
        <a
          href="#"
          className="mr-4 hover:underline hover:text-[#e2d394] transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
        >
          Carrinho
        </a>
      </nav>
    )}
  </header>
  );
}

export default Header;
