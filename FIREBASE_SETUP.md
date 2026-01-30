# 🔥 FIREBASE INTEGRATION - GUIA COMPLETO

## 📋 Visão Geral

Integração completa de Firebase (Autenticação, Firestore, Storage) no seu e-commerce de cosméticos. 

**Status**: ✅ Pronto para usar  
**Versão Firebase**: v9+ (modular)

---

## 📁 Estrutura de Arquivos Criada

```
src/
├── firebase/
│   ├── firebase.js          ← Inicialização do Firebase
│   ├── auth.js              ← Login, Signup, Logout
│   ├── firestore.js         ← CRUD de produtos
│   └── storage.js           ← Upload de imagens
├── context/
│   ├── CartContext.jsx      (existente)
│   └── AuthContext.jsx      ← Context de autenticação
├── hooks/
│   └── useFirebase.js       ← Hook centralizado do Firebase
├── App.jsx                  (ATUALIZADO - com AuthProvider)
└── Pages/
    └── Sign.jsx             (pronto para implementar Login/Signup)
```

---

## 🚀 Como Usar (Exemplos Rápidos)

### 1️⃣ **AUTENTICAÇÃO (Login/Signup)**

#### No seu componente Sign.jsx:

```jsx
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Sign() {
  const { login, signup, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, name);
      console.log("Conta criada com sucesso!");
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      console.log("Conectado com sucesso!");
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div>
      {!isAuthenticated ? (
        <>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Criar Conta</button>
          </form>
          <button onClick={handleLogin}>Entrar</button>
        </>
      ) : (
        <p>Bem-vindo, {user.displayName}!</p>
      )}
    </div>
  );
}
```

---

### 2️⃣ **CRIAR PRODUTO COM IMAGEM**

```jsx
import { useFirebase } from "../hooks/useFirebase";
import { useState } from "react";

export default function AddProduct() {
  const { createProduct, uploadImage, loading, error } = useFirebase();
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    category: "Bases",
    description: "",
    stock: 0,
  });
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Upload imagem
      const productId = "temp-" + Date.now(); // Gerar ID temporário
      const imageUrl = await uploadImage(imageFile, productId);

      // 2️⃣ Criar produto com URL da imagem
      await createProduct({
        ...formData,
        imageUrl: imageUrl,
      });

      console.log("Produto criado com sucesso!");
      setFormData({ name: "", price: 0, category: "Bases", description: "", stock: 0 });
      setImageFile(null);
    } catch (err) {
      console.error("Erro:", err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome do Produto"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <input
        type="number"
        placeholder="Preço"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
        required
      />

      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      >
        <option value="Bases">Bases</option>
        <option value="Pó">Pó</option>
        <option value="Sombras">Sombras</option>
        <option value="Batom">Batom</option>
      </select>

      <textarea
        placeholder="Descrição"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <input
        type="number"
        placeholder="Estoque"
        value={formData.stock}
        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Adicionar Produto"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
```

---

### 3️⃣ **LISTAR TODOS OS PRODUTOS**

```jsx
import { useFirebase } from "../hooks/useFirebase";
import { useEffect } from "react";

export default function ProductList() {
  const { products, fetchAllProducts, loading, error } = useFirebase();

  useEffect(() => {
    fetchAllProducts();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <img src={product.imageUrl} alt={product.name} title={product.name} />
          <p>Preço: {product.price}</p>
          <p>Categoria: {product.category}</p>
          <p>Estoque: {product.stock}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### 4️⃣ **ATUALIZAR PRODUTO**

```jsx
const { updateProductData } = useFirebase();

const handleUpdate = async (productId) => {
  await updateProductData(productId, {
    price: 49.99,
    stock: 100,
  });
};
```

---

### 5️⃣ **ATUALIZAR IMAGEM DO PRODUTO**

```jsx
const { updateProductWithImage } = useFirebase();

const handleUpdateImage = async (productId, file) => {
  const newImageUrl = await updateProductWithImage(productId, file);
  console.log("Nova imagem:", newImageUrl);
};
```

---

### 6️⃣ **DELETAR PRODUTO**

```jsx
const { removeProduct } = useFirebase();

const handleDelete = async (productId) => {
  await removeProduct(productId);
  console.log("Produto deletado!");
};
```

---

### 7️⃣ **BUSCAR PRODUTOS POR CATEGORIA**

```jsx
const { fetchProductsByCategory } = useFirebase();

const handleFetchCategory = async () => {
  const bases = await fetchProductsByCategory("Bases");
  console.log(bases);
};
```

---

### 8️⃣ **BUSCAR PRODUTOS (Search)**

```jsx
const { search } = useFirebase();

const handleSearch = async (searchTerm) => {
  const results = await search(searchTerm);
  console.log(results);
};
```

---

## 🔐 Context API - useAuth Hook

Use em qualquer componente para acessar dados do usuário autenticado:

```jsx
import { useAuth } from "../context/AuthContext";

export default function MyComponent() {
  const { 
    user,                    // { uid, email, displayName } ou null
    isAuthenticated,         // boolean
    loading,                 // boolean (durante operação)
    error,                   // string com mensagem de erro
    login,                   // async (email, password)
    signup,                  // async (email, password, displayName)
    logout,                  // async ()
  } = useAuth();

  if (loading) return <p>Verificando autenticação...</p>;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Bem-vindo, {user.displayName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Faça login para continuar</p>
      )}
    </div>
  );
}
```

---

## 📊 Hook useFirebase - Referência Completa

### Estado

```jsx
const {
  products,              // Array de produtos carregados
  loading,               // boolean - true enquanto carregando
  error,                 // string - mensagem de erro ou null
} = useFirebase();
```

### Operações com Imagens

```jsx
const imageUrl = await uploadImage(file, productId);
const newUrl = await updateImage(productId, file);
await removeImage(productId);
```

### Operações com Produtos

```jsx
const productId = await createProduct({ name, price, category, ... });
const allProducts = await fetchAllProducts();
const product = await fetchProduct(productId);
const categoryProducts = await fetchProductsByCategory("Bases");
await updateProductData(productId, { price: 29.99 });
const newImageUrl = await updateProductWithImage(productId, file);
await removeProduct(productId);
```

### Busca e Filtros

```jsx
const results = await search("base");
const inStock = await fetchInStockProducts();
```

### Utilitários

```jsx
clearError();  // Limpa mensagem de erro
```

---

## 🛢️ Estrutura de Dados no Firestore

### Coleção: `produtos`

```json
{
  "id": "auto-generated",
  "name": "Base Super Stay 56",
  "price": 24000,
  "category": "Bases",
  "description": "Base líquida com cobertura total",
  "stock": 50,
  "imageUrl": "https://firebasestorage.googleapis.com/.../image.png",
  "createdAt": "2025-01-28T10:00:00Z",
  "updatedAt": "2025-01-28T10:00:00Z"
}
```

### Storage: Organização de Imagens

```
products/
├── {productId-1}/
│   └── image.png
├── {productId-2}/
│   └── image.png
└── {productId-3}/
    └── image.png
```

---

## ⚠️ Validações Implementadas

### Upload de Imagem
- ✅ Verifica se é arquivo de imagem
- ✅ Valida tamanho máximo (5MB)
- ✅ Trata erros e fornece feedback

### Criar Produto
- ✅ Valida campos obrigatórios (name, price, category, imageUrl)
- ✅ Valida preço (número positivo)
- ✅ Limpa espaços em branco

### Atualizar Produto
- ✅ Verifica se produto existe
- ✅ Valida preço se fornecido
- ✅ Atualiza timestamp

### Deletar Produto
- ✅ Deleta imagem do Storage
- ✅ Deleta documento do Firestore
- ✅ Trata erros de forma graciosa

---

## 🛡️ Segurança (Próximas Etapas)

Para produção, configure regras no Firebase Console:

### Firestore Rules (src/firestore.rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Público: ler todos os produtos
    match /produtos/{document=**} {
      allow read: if true;
    }
    
    // Admin: criar, editar e deletar produtos
    match /produtos/{document=**} {
      allow write: if isAdmin();
    }
    
    function isAdmin() {
      return request.auth.uid in getDatabase().ref("admins").val()
    }
  }
}
```

### Storage Rules (src/storage.rules)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Público: ler imagens de produtos
    match /products/{allPaths=**} {
      allow read: if true;
    }
    
    // Admin: upload e delete
    match /products/{allPaths=**} {
      allow write: if isAdmin();
    }
    
    function isAdmin() {
      return request.auth.token.admin == true
    }
  }
}
```

---

## 🧪 Testando Localmente

### 1️⃣ Verificar Firebase Inicializado
```jsx
import { app, auth, db, storage } from "./firebase/firebase.js";

console.log(app);     // Deve mostrar objeto Firebase
console.log(auth);    // Firebase Auth
console.log(db);      // Firestore
console.log(storage); // Storage
```

### 2️⃣ Testar Signup
```jsx
import { signup } from "./firebase/auth";

const user = await signup("test@example.com", "password123", "Test User");
console.log(user); // { uid, email, displayName }
```

### 3️⃣ Testar Login
```jsx
import { login } from "./firebase/auth";

const user = await login("test@example.com", "password123");
console.log(user); // { uid, email, displayName }
```

### 4️⃣ Testar Upload de Imagem
```jsx
import { uploadProductImage } from "./firebase/storage";

const input = document.querySelector("input[type='file']");
const imageUrl = await uploadProductImage(input.files[0], "product-123");
console.log(imageUrl); // URL pública
```

### 5️⃣ Testar Criar Produto
```jsx
import { saveProduct } from "./firebase/firestore";

const productId = await saveProduct({
  name: "Base Test",
  price: 25000,
  category: "Bases",
  imageUrl: "https://...",
});
console.log(productId);
```

---

## 📚 Arquivos Criados

| Arquivo | Descrição | Funções Principais |
|---------|-----------|-------------------|
| `firebase.js` | Inicialização | initializeApp, getAuth, getFirestore, getStorage |
| `auth.js` | Autenticação | signup, login, logout, getCurrentUser, onAuthStateChanged |
| `storage.js` | Upload de imagens | uploadProductImage, updateProductImage, deleteProductImage |
| `firestore.js` | CRUD de produtos | saveProduct, getAllProducts, updateProduct, deleteProduct, etc |
| `AuthContext.jsx` | Context de Auth | AuthProvider, useAuth hook |
| `useFirebase.js` | Hook centralizado | useFirebase hook com todas as operações |
| `App.jsx` | Atualizado | AuthProvider wrapper |

---

## ✅ Checklist de Implementação

- ✅ Firebase inicializado e conectado
- ✅ Autenticação (signup, login, logout)
- ✅ Firestore CRUD completo
- ✅ Storage com upload de imagens
- ✅ AuthContext para estado global
- ✅ useFirebase hook centralizado
- ✅ Validações e tratamento de erros
- ✅ App.jsx envolvido com AuthProvider
- ⏳ Componentes de UI (Sign.jsx, AdminPanel, etc)
- ⏳ Regras de segurança no Firebase Console

---

## 🚀 Próximas Etapas

1. **Implementar componentes de UI**
   - Sign.jsx → Login/Signup completo
   - AdminPanel.jsx → Gerenciar produtos
   - ProductForm.jsx → Criar/editar produtos

2. **Integrar com carrinho existente**
   - Usar produtos do Firestore em vez de JSON

3. **Configurar regras de segurança**
   - Firestore Rules
   - Storage Rules

4. **Adicionar recursos**
   - Wishlist persistente
   - Histórico de pedidos
   - Reviews de produtos

5. **Otimizar performance**
   - Paginação de produtos
   - Cache local
   - Imagens otimizadas

---

## 📞 Suporte

Qualquer dúvida? Revise:
- Documentação Firebase: https://firebase.google.com/docs
- React Firebase Hooks: https://github.com/CSFrequency/react-firebase-hooks
- Best Practices: https://firebase.google.com/docs/firestore/best-practices

---

**Status Final**: ✅ Integração Firebase Completa e Pronta para Uso!
