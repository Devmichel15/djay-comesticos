import produtosData from "../produtos.json";

/**
 * Search products by name or category.
 * Currently uses the local JSON data as the source of truth for search,
 * which is faster and sufficient given the current architecture.
 *
 * @param {string} query - The search term
 * @returns {Array} - Array of matching products with their generated IDs
 */
export const searchProducts = (query) => {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();
  const results = [];

  produtosData.forEach((categoria, catIdx) => {
    // Check if category matches
    const catMatch = categoria.categoria.toLowerCase().includes(lowerQuery);

    if (categoria.produtos) {
      categoria.produtos.forEach((produto, prodIdx) => {
        // Check if product name matches
        const nameMatch = produto.nome.toLowerCase().includes(lowerQuery);

        if (catMatch || nameMatch) {
          results.push({
            ...produto,
            categoria: categoria.categoria,
            // Generate a consistent ID for routing
            id: `${catIdx}-${prodIdx}`,
            // Also include the CartContext ID format for context
            cartId: `${categoria.categoria}-${produto.nome}`,
          });
        }
      });
    }
  });

  return results;
};
