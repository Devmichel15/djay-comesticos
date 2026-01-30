import React, { useEffect, useState } from "react";
import { useFirebase } from "../hooks/useFirebase";
import { useAuth } from "../context/AuthContext";

export default function AdminPanel() {
  const { products, fetchAllProducts, loading, error, createProduct, uploadImage, removeProduct, updateProductData, updateProductWithImage } = useFirebase();
  const { user } = useAuth();

  const [form, setForm] = useState({ name: "", price: 0, category: "", description: "", stock: 0 });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // upload image first with temp id
      const tempId = `temp-${Date.now()}`;
      const imageUrl = file ? await uploadImage(file, tempId) : "";
      const productId = await createProduct({ ...form, imageUrl });
      alert("Produto criado: " + productId);
      setForm({ name: "", price: 0, category: "", description: "", stock: 0 });
      setFile(null);
      await fetchAllProducts();
    } catch (err) {
      alert(err.message || "Erro ao criar produto");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deletar produto?")) return;
    try {
      await removeProduct(id);
      await fetchAllProducts();
    } catch (err) {
      alert(err.message || "Erro ao deletar");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Painel Admin</h2>
      <p>Usuário: {user?.email} ({user?.role})</p>

      <section className="mt-6">
        <h3 className="font-semibold mb-2">Criar Produto</h3>
        <form onSubmit={handleCreate} className="flex flex-col gap-2 max-w-md">
          <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Nome" required />
          <input type="number" value={form.price} onChange={(e)=>setForm({...form,price:parseFloat(e.target.value)})} placeholder="Preço" required />
          <input value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} placeholder="Categoria" required />
          <input type="number" value={form.stock} onChange={(e)=>setForm({...form,stock:parseInt(e.target.value)})} placeholder="Estoque" />
          <textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Descrição" />
          <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files[0])} />
          <button type="submit" className="bg-black text-white py-2 px-4 rounded">Criar</button>
        </form>
      </section>

      <section className="mt-8">
        <h3 className="font-semibold mb-2">Produtos</h3>
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products && products.map((p) => (
            <div key={p.id} className="border p-3 rounded">
              <img src={p.imageUrl} alt={p.name} title={p.name} className="h-32 object-contain mb-2" />
              <h4 className="font-bold">{p.name}</h4>
              <p>{p.category} - {p.price}</p>
              <p>Estoque: {p.stock}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={()=>handleDelete(p.id)} className="bg-red-600 text-white py-1 px-2 rounded">Deletar</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
