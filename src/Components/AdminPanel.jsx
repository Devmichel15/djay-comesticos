import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppwrite } from "../hooks/useAppwrite";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  X,
  Upload,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPanel() {
  const {
    products,
    fetchAllProducts,
    loading,
    error,
    createProduct,
    uploadImage,
    removeProduct,
  } = useAppwrite();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: 0,
    category: "Todos",
    description: "",
    stock: 0,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      let imageId = "";
      if (file) {
        const uploadResult = await uploadImage(file);
        imageId = uploadResult.fileId;
      }
      await createProduct({ ...form, imageId });
      setForm({
        name: "",
        price: 0,
        category: "Todos",
        description: "",
        stock: 0,
      });
      setFile(null);
      setPreview(null);
      setShowModal(false);
      await fetchAllProducts();
    } catch (err) {
      alert(err.message || "Erro ao criar produto");
    }
  };

  const handleDelete = async (id, imageId) => {
    if (!confirm("Deletar produto?")) return;
    try {
      await removeProduct(id, imageId);
      await fetchAllProducts();
    } catch (err) {
      alert(err.message || "Erro ao deletar");
    }
  };

  // Calculate stats
  const totalProducts = products?.length || 0;
  const lowStockProducts = products?.filter((p) => p.stock < 5).length || 0;
  const totalStock = products?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0;

  // Category distribution
  const categoryData = {};
  products?.forEach((p) => {
    categoryData[p.category] = (categoryData[p.category] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-white">
              DJAY<span className="text-gold">.</span> Admin
            </h1>
            <p className="text-xs text-white/50 font-mono mt-1">
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/70 hover:text-gold transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-mono">Voltar ao Site</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-3 px-4 font-mono text-sm transition-all ${
              activeTab === "dashboard"
                ? "text-gold border-b-2 border-gold"
                : "text-white/50 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 px-4 font-mono text-sm transition-all ${
              activeTab === "products"
                ? "text-gold border-b-2 border-gold"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Produtos
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-gold/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/50 text-xs font-mono uppercase tracking-wider mb-2">
                      Total de Produtos
                    </p>
                    <p className="text-4xl font-bold text-white">
                      {totalProducts}
                    </p>
                  </div>
                  <div className="bg-gold/10 p-3 rounded-xl">
                    <Package className="w-6 h-6 text-gold" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-gold/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/50 text-xs font-mono uppercase tracking-wider mb-2">
                      Estoque Total
                    </p>
                    <p className="text-4xl font-bold text-white">
                      {totalStock}
                    </p>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-red-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/50 text-xs font-mono uppercase tracking-wider mb-2">
                      Estoque Baixo
                    </p>
                    <p className="text-4xl font-bold text-red-400">
                      {lowStockProducts}
                    </p>
                  </div>
                  <div className="bg-red-500/10 p-3 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-6">
                  Distribuição por Categoria
                </h3>
                <div className="space-y-4">
                  {Object.entries(categoryData).map(([cat, count]) => {
                    const percentage = (count / totalProducts) * 100;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/70">{cat}</span>
                          <span className="text-gold font-mono">{count}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.3, duration: 1 }}
                            className="bg-gradient-to-r from-gold to-yellow-600 h-full rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stock Levels */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-6">
                  Níveis de Estoque
                </h3>
                <div className="space-y-3">
                  {products?.slice(0, 5).map((product, idx) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between py-2 border-b border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="text-white/80 text-sm">
                          {product.name}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-mono px-2 py-1 rounded ${
                          product.stock < 5
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Gestão de Produtos
              </h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gold text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-yellow-600 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Produto
              </button>
            </div>

            {loading && (
              <p className="text-white/50 text-center">Carregando...</p>
            )}
            {error && <p className="text-red-400 text-center">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products?.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-gold/50 transition-all group"
                >
                  <div className="relative h-48 bg-white/5">
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-contain p-4"
                      />
                    )}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleDelete(p.id, p.imageId)}
                        className="bg-red-500/80 p-2 rounded-lg hover:bg-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="text-white font-bold mb-1 line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-white/50 text-xs mb-3">{p.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gold font-bold">{p.price} kz</span>
                      <span
                        className={`text-xs font-mono px-2 py-1 rounded ${
                          p.stock < 5
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        Estoque: {p.stock}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Adicionar Produto
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Nome do Produto
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Base Líquida"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-gold transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">
                      Preço (kz)
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: parseFloat(e.target.value) })
                      }
                      placeholder="0"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-gold transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">
                      Estoque
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: parseInt(e.target.value) })
                      }
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-gold transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Categoria
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-gold transition-all"
                  >
                    <option value="Todos" className="bg-neutral-900">
                      Todos
                    </option>
                    <option value="Mais Vendidos" className="bg-neutral-900">
                      Mais Vendidos
                    </option>
                    <option value="Maquiagem" className="bg-neutral-900">
                      Maquiagem
                    </option>
                    <option value="Skincare" className="bg-neutral-900">
                      Skincare
                    </option>
                    <option value="Cabelo" className="bg-neutral-900">
                      Cabelo
                    </option>
                    <option value="Perfume" className="bg-neutral-900">
                      Perfume
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Copy (Descrição)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Escreva uma descrição promocional do produto..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-gold transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Imagem
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="w-full bg-white/5 border border-white/10 border-dashed text-white rounded-xl px-4 py-8 cursor-pointer hover:border-gold transition-all flex flex-col items-center justify-center gap-2"
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-32 object-contain mb-2"
                        />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-white/30" />
                          <span className="text-sm text-white/50">
                            Clique para escolher imagem
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-600 transition-all"
                >
                  Criar Produto
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
