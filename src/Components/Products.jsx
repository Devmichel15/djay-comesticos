import React from "react";
import { motion } from "motion/react";
import produtosData from "../produtos.json";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.15, delayChildren: 0.3, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  hover: {
    scale: 1.05,
    
    transition: { duration: 0.3, yoyo: Infinity },
  },
};

function Products() {
  return (
    <div className="p-8 bg-linear-to-b from-white via-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-12 text-black drop-shadow-md">
        Nossos Produtos
      </h1>

      {produtosData.map((categoria, idx) => (
        <div key={idx} className="mb-16">
          <h2 className="text-3xl font-semibold mb-6 text-gray-900 border-b-4 border-gold-500 inline-block pb-2">
            {categoria.categoria}
          </h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categoria.produtos.map((produto, pIdx) => (
              <motion.div
                key={pIdx}
                className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col items-center max-w-xs mx-auto cursor-pointer"
                variants={cardVariants}
                whileHover="hover"
              >
                {/* Área da imagem com fundo cinza e cantos arredondados */}
                <div className="w-full h-56 bg-linear-to-tr from-gray-300 via-gray-400 to-gray-500 rounded-t-3xl flex items-center justify-center relative overflow-hidden">
                  {produto.img ? (
                    <img
                      src={produto.img}
                      alt={produto.nome}
                      className="object-contain h-full rounded-t-3xl transition-transform duration-300 ease-in-out hover:scale-105"
                    />
                  ) : (
                    <span className="text-gray-300 text-sm">
                      Imagem não disponível
                    </span>
                  )}

                  {/* Marca dourada no canto superior direito */}
                  <div className="absolute top-3 right-3 bg-linear-to-br from-yellow-400 to-yellow-600 text-black font-bold text-xs px-3 py-1 rounded-full shadow-lg select-none pointer-events-none">
                    Premium
                  </div>
                </div>

                {/* Conteúdo textual */}
                <div className="p-6 flex flex-col items-start w-full">
                  <h3 className="text-lg font-mono font-semibold mb-3 text-black">
                    {produto.nome}
                  </h3>
                  <p className="text-sm mb-6 text-gray-700 leading-relaxed font-sans">
                    {produto.copy}
                  </p>

                  {/* Preço e botão alinhados */}
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-lg font-semibold text-black">
                      {produto.preco}
                    </span>
                    <button
                      type="button"
                      className="bg-linear-to-r from-yellow-500 to-yellow-600 text-black rounded-full px-7 py-2 font-mono text-base font-semibold shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors duration-300"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export default Products;
