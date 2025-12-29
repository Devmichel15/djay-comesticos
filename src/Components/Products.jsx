import React from "react";
import produtosData from "../produtos.json";

function Products() {
  return (
    <div className="p-6 bg-white">
      <h1 className="text-3xl font-bold text-center mb-8">Alguns Produtos</h1>

      {produtosData.map((categoria, idx) => (
        <div key={idx} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{categoria.categoria}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoria.produtos.map((produto, pIdx) => (
              <div
                key={pIdx}
                className="border rounded-lg shadow-md overflow-hidden bg-white flex flex-col items-center"
              >
                <div className="w-full h-56 flex items-center justify-center bg-gray-100">
                  {produto.img ? (
                    <img
                      src={produto.img}
                      alt={produto.nome}
                      className="object-contain h-full"
                    />
                  ) : (
                    <span className="text-gray-400">Imagem não disponível</span>
                  )}
                </div>

                <div className="p-4 flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-2 text-center">{produto.nome}</h3>
                  <p className="text-gray-700 font-medium">{produto.preco}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Products;
