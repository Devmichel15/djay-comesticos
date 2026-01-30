# 🛍️ Secção "MAIS VENDIDOS" - Guia Completo

## ✅ O que foi criado

### Novo Componente: `BestSellersSection.jsx`

**Localização**: `src/Components/BestSellersSection.jsx`

**Características Principais**:
- ✅ Grid responsivo (5 colunas desktop, 3 tablet, scroll horizontal mobile)
- ✅ Cards comerciais e limpos
- ✅ Badge de desconto (-10%, -20%, etc)
- ✅ Ícone de favoritos (coração)
- ✅ Preço antigo riscado + preço atual
- ✅ Botão "ADICIONAR" integrado com carrinho
- ✅ Integração total com CartContext

---

## 📐 Layout do Card

Cada card contém:

```
┌─────────────────────────────┐
│ [-15%]  ❤️                  │  ← Badge de desconto + Favoritos
├─────────────────────────────┤
│                             │
│         [IMAGEM]            │  ← Imagem centralizada, sem background pesado
│                             │
├─────────────────────────────┤
│ CATEGORIA                   │  ← Pequeno, uppercase, muted
│                             │
│ Nome do Produto em 2        │  ← Max 2 linhas com ellipsis
│ Linhas                      │
│                             │
│ 28.000kz  24.000kz          │  ← Preço antigo (riscado) + atual
│                             │
│ [🛒 ADICIONAR]              │  ← Botão preto com ícone
└─────────────────────────────┘
```

---

## 📊 Grid Responsivo

### Desktop (lg breakpoint)
- **5 colunas** de produtos
- Gap: 24px entre cards
- Padding: 6 unidades (24px)

### Tablet (sm breakpoint)
- **3 colunas**
- Mesmo gap e espaçamento

### Mobile (< sm)
- **Scroll horizontal**
- Cards com largura fixa (288px / w-72)
- Snap-scroll suave

---

## 🎨 Design Specs

| Elemento | Cor | Tamanho | Estilo |
|----------|-----|--------|--------|
| Fundo da secção | Branco (#fff) | - | Clean |
| Card | Branco + borda cinza | - | Border: 1px gray-200 |
| Badge desconto | Vermelho (#ef4444) | text-xs | Font-bold, rounded-full |
| Categoria | Cinza (#6b7280) | text-xs | Uppercase, tracking-widest |
| Nome | Cinza escuro (#111827) | text-sm | Font-semibold, line-clamp-2 |
| Preço antigo | Cinza (#9ca3af) | text-xs | Line-through |
| Preço atual | Cinza escuro (#111827) | text-lg | Font-bold |
| Botão | Preto (#000) | text-sm | Hover: bg-gray-900 |

---

## 🔧 Funcionalidades

### 1. **Adicionar ao Carrinho**
```javascript
handleAddToCart(product)
// → Integrado com CartContext
// → Badge no ícone da navbar atualiza automaticamente
```

### 2. **Toggle Favoritos**
```javascript
toggleWishlist(productId)
// → Coração muda de cor (vermelho quando selecionado)
// → Estado local (não persiste, apenas visual)
```

### 3. **Navegação**
```javascript
onClick={() => navigate(`/produto/${product.productId}`)}
// → Clique na imagem/nome → vai para ProductPage
// → Clique "ADICIONAR" → adiciona ao carrinho
```

---

## 📍 Integração na Homepage

**Arquivo**: `src/Pages/Home.jsx`

```jsx
import BestSellersSection from "../Components/BestSellersSection";

function Home() {
  return (
    <div>
      <PremiumNavbar />
      <main>
        <Hero3D />
        <FeatureGrid />
        <BestSellersSection />  {/* ← NOVA SECÇÃO */}
      </main>
      <FooterCTA />
    </div>
  );
}
```

---

## 📦 Dados dos Produtos

Os produtos são selecionados do `produtos.json` via índices:

```javascript
const bestSellers = [
  {
    categoryIndex: 1,        // Categoria: Bases
    productIndex: 0,         // Primeiro produto da categoria
    discount: 15,            // Desconto de 15%
    oldPrice: "28.000kz",    // Preço antigo
  },
  // ... mais 5 produtos
];
```

**Como Adicionar Mais Produtos**:
1. Encontre o índice da categoria no `produtos.json`
2. Encontre o índice do produto dentro da categoria
3. Adicione um novo objeto ao array `bestSellers`

Exemplo:
```javascript
{
  categoryIndex: 3,      // Sombras
  productIndex: 2,       // Terceiro produto
  discount: 25,
  oldPrice: "40.000kz",
}
```

---

## 🖼️ Como Customizar Imagens

As imagens são referenciadas do atributo `img` dos produtos em `produtos.json`.

**Diretório**: `/public/` (raiz do projeto)

**Formato esperado**: `/product1.png`, `/product2.png`, etc

**Para mudar imagens**:
1. Coloque novas imagens em `/public/`
2. Atualize o atributo `img` no `produtos.json`

Exemplo:
```json
{
  "nome": "Base Super Stay 56",
  "img": "/product6.png",  // ← Path da imagem
  "preco": "24.000kz"
}
```

---

## 🎯 Customizações Fáceis

### 1. **Mudar Número de Colunas**
```jsx
// Desktop
<div className="grid-cols-5">  → change to grid-cols-4, grid-cols-6, etc

// Tablet
<div className="sm:grid-cols-3">  → change to sm:grid-cols-2, sm:grid-cols-4, etc
```

### 2. **Mudar Cores do Badge de Desconto**
```jsx
<div className="bg-red-500">  → change to bg-orange-500, bg-blue-500, etc
```

### 3. **Mudar Tamanho da Imagem**
```jsx
<div className="h-64">  → change to h-56, h-72, etc
```

### 4. **Adicionar Animações (Opcional)**
```jsx
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  className="..."
>
```

---

## ✨ Features Implementadas

| Feature | Status | Detalhe |
|---------|--------|---------|
| Grid responsivo | ✅ | 5 cols (desktop), 3 cols (tablet), scroll (mobile) |
| Cards comerciais | ✅ | Border simples, hover shadow |
| Badge desconto | ✅ | Vermelho, posicionado no topo-esquerda |
| Ícone favoritos | ✅ | Coração, toggle cor |
| Preços | ✅ | Antigo (riscado) + atual |
| Botão carrinho | ✅ | Preto, ícone, integrado com context |
| Navegação | ✅ | Clique na imagem → ProductPage |
| Responsividade | ✅ | Mobile, tablet, desktop |
| Sem animações complexas | ✅ | Apenas hover simples + transitions |

---

## 🚀 Próximos Passos (Opcionais)

### 1. **Persistência de Favoritos**
```javascript
useEffect(() => {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}, [wishlist]);
```

### 2. **Dados Dinâmicos da API**
```javascript
useEffect(() => {
  fetch("/api/best-sellers")
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

### 3. **Carrossel com Botões (Opcionali)**
```jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
// → Adicionar botões de navegação
```

### 4. **Filtros por Categoria**
```jsx
<button onClick={() => filterByCategory("Bases")}>
  Bases
</button>
```

---

## 📝 Estrutura de Arquivos

```
src/
├── Components/
│   └── BestSellersSection.jsx     (NOVO)
│       ├── ProductCard (subcomponent)
│       └── BestSellersSection (main)
├── Pages/
│   └── Home.jsx                   (ATUALIZADO)
└── produtos.json                  (SEM MUDANÇAS)
```

---

## ✅ Checklist de QA

- ✅ Desktop: 5 colunas, grid com gap
- ✅ Tablet: 3 colunas, grid com gap
- ✅ Mobile: Scroll horizontal suave
- ✅ Badge desconto visível e posicionado
- ✅ Coração funciona (toggle cor)
- ✅ Botão "ADICIONAR" → adiciona ao carrinho
- ✅ Badge do carrinho atualiza
- ✅ Clique na imagem → navega para produto
- ✅ Sem erros no console
- ✅ Imagens carregam corretamente
- ✅ Preços formatados corretamente
- ✅ Responsividade em todos os breakpoints

---

## 🎊 Status: ✅ PRONTO PARA USO

A secção "MAIS VENDIDOS" foi implementada com sucesso!

**Acesse agora**: http://localhost:5174/

Role para baixo e veja a nova secção com todos os 6 produtos mais vendidos.

---

**Desenvolvido com**: React + Tailwind CSS + React Router + Context API
