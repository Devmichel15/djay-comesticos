# 🧪 GUIA DE TESTES - Responsividade + Carrinho

**Data:** 29 de janeiro de 2026

---

## 📱 TESTE 1: Responsividade no Mobile

### Pré-requisitos
- [ ] Abra o site em um celular real (Android/iOS) ou use DevTools

### Passo a Passo

#### Teste 1.1: Mobile (375px - iPhone SE)
```
1. Abra DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Selecione "iPhone SE" ou configure 375x667
4. Navegue para um produto (clique "Comprar")
```

**Esperado:**
- [ ] Imagem responsiva (não quebra, não fica gigante)
- [ ] Título legível (não muito pequeno)
- [ ] Botão "Adicionar ao Carrinho" full-width
- [ ] Sem scroll horizontal
- [ ] Quantidade e botões clicáveis
- [ ] Rating com stars visível
- [ ] Preço destacado
- [ ] Seções (Características, Como Usar, etc) expansíveis

**Screenshots esperados:**
```
┌─────────────┐
│   Breadcrumb│  ← Pequeno mas legível
├─────────────┤
│   Imagem    │  ← Quadrada, responsiva
│   100x100   │
├─────────────┤
│   Título    │  ← 30px
│   ⭐⭐⭐⭐⭐│
│   2.500kz   │  ← Preço destacado
├─────────────┤
│  - Qty +    │  ← Fácil de usar
│ [Add Cart]  │  ← Full width
├─────────────┤
│ ✓ Envio     │
│ ✓ Garantia  │
│ ✓ Original  │
└─────────────┘
```

---

#### Teste 1.2: Tablet (768px - iPad)
```
1. Selecione "iPad" ou configure 768x1024
2. Navegue para um produto
```

**Esperado:**
- [ ] Layout ainda em coluna (imagem acima, info abaixo)
- [ ] Mais espaço, mas estrutura igual ao mobile
- [ ] Imagem pode ser um pouco maior
- [ ] Botão ainda full-width

---

#### Teste 1.3: Desktop (1920px)
```
1. Deselecione Device Toolbar (Ctrl+Shift+M) ou set 1920x1080
2. Navegue para um produto
```

**Esperado:**
- [ ] **Layout lado-a-lado** (imagem esquerda, info direita)
- [ ] Imagem maior, com gap entre elementos
- [ ] Botão "Adicionar ao Carrinho" auto-width (não full)
- [ ] Texto maior (48px para título)
- [ ] Seções expandidas com boa leitura
- [ ] Nenhum overflow

**Screenshots esperados:**
```
┌──────────────────────────────────────────────────┐
│ Home / Categoria / Produto                       │
├──────────────────┬───────────────────────────────┤
│                  │  Título (48px)                │
│                  │  ⭐⭐⭐⭐⭐ (128 reviews)    │
│     Imagem       │                               │
│     Quadrada     │  2.500kz                      │
│     300x300      │  ✓ Em Stock                   │
│                  │                               │
│                  │  Descrição do produto...      │
│                  │                               │
│                  │  Qty: [- 1 +]                │
│                  │  [Add Cart] [More Info]      │
│                  │                               │
│                  │  ✓ Envio Grátis              │
│                  │  ✓ Garantia                  │
│                  │  ✓ Original                  │
└──────────────────┴───────────────────────────────┘
```

---

## 🛒 TESTE 2: Persistência do Carrinho

### Pré-requisitos
- [ ] Faça login na conta
- [ ] Abra DevTools (F12) → Console
- [ ] Abra Firebase Console → Firestore → Collection "users"

### Teste 2.1: Adicionar Produto

```
1. Clique em um produto para abrir página individual
2. Selecione quantidade (ex: 2)
3. Clique "Adicionar ao Carrinho"
```

**No Console - Esperado:**
```
✅ Product added to cart: Foundation Matte HD
✅ Cart updated in Firestore: uid123 1 items
📡 Setting up cart subscription: uid123
✅ Cart data received: uid123 1 items
```

**No Firebase Console - Esperado:**
```
users/{uid}
├── uid: "uid123"
├── email: "user@example.com"
├── name: "João"
├── cart: [
│   {
│     "id": "Bases-Foundation Matte HD",
│     "nome": "Foundation Matte HD",
│     "categoria": "Bases",
│     "preco": "2.500kz",
│     "quantity": 2
│   }
│ ]
└── updatedAt: "2026-01-29T10:30:00.000Z"
```

---

### Teste 2.2: Recarregar Página (F5)

```
1. Adicione um produto ao carrinho
2. Recarregue a página (F5)
3. Verifique se carrinho persiste
```

**Esperado:**
```
Console:
✅ Cart loaded from Firestore: uid123 1 items

Visual:
- Badge no ícone do carrinho mostra "1"
- CartDrawer abre mostrando o produto
```

---

### Teste 2.3: Adicionar Múltiplos Produtos

```
1. Volte à home
2. Clique em produtos diferentes (3-4 produtos)
3. Para cada um, adicione quantidade diferente
   - Produto 1: Qty 2
   - Produto 2: Qty 1
   - Produto 3: Qty 3
4. Verifique Firebase e Console
```

**Console - Esperado:**
```
✅ Product added to cart: Foundation Matte HD
✅ Cart updated in Firestore: uid123 1 items

✅ Product added to cart: Blush Cremoso
✅ Cart updated in Firestore: uid123 2 items

✅ Product added to cart: Lipstick Ruby
✅ Cart updated in Firestore: uid123 3 items
```

**Firebase - Esperado:**
```
cart: [
  { nome: "Foundation...", quantity: 2 },
  { nome: "Blush...", quantity: 1 },
  { nome: "Lipstick...", quantity: 3 }
]
```

---

### Teste 2.4: Atualizar Quantidade

```
1. Abra CartDrawer (clique ícone carrinho)
2. Mude quantidade de um produto (ex: 2 → 5)
3. Verifique Firestore e Console
```

**Console - Esperado:**
```
✅ Quantity updated: Bases-Foundation Matte HD qty: 5
✅ Cart updated in Firestore: uid123 3 items
✅ Cart data received: uid123 3 items
```

**Firebase - Esperado:**
```
cart[0]: { ..., quantity: 5 }  ← Atualizado
```

---

### Teste 2.5: Remover Produto

```
1. No CartDrawer, clique X em um produto
2. Verifique Firestore e Console
```

**Console - Esperado:**
```
✅ Product removed from cart: Bases-Foundation Matte HD
✅ Cart updated in Firestore: uid123 2 items
✅ Cart data received: uid123 2 items
```

**Firebase - Esperado:**
```
cart: [
  { nome: "Blush...", quantity: 1 },
  { nome: "Lipstick...", quantity: 3 }
]  ← Primeira entrada deletada
```

---

### Teste 2.6: Logout e Login

```
1. Com carrinho cheio, clique em Logout
2. Faça login novamente
3. Verifique se carrinho volta
```

**Esperado:**
```
- Ao logout: Carrinho limpa da UI
- Ao login: Carrinho carrega do Firestore
- Console mostra: "✅ Cart loaded from Firestore: X items"
```

---

### Teste 2.7: Múltiplas Abas (Real-Time Sync)

```
1. Abra site em Aba 1 (Firefox) e Aba 2 (Chrome)
2. Faça login em ambas as abas
3. Adicione produto na Aba 1
4. Observe Aba 2 - deve atualizar automaticamente
```

**Esperado:**
```
Aba 1: Clica "Adicionar ao Carrinho"
└─► Firestore atualiza
    └─► Aba 2 ouve mudança
        └─► Carrinho aparece na Aba 2 automaticamente
```

---

## ⚠️ TESTE 3: Usuário Não Logado

```
1. Logout ou abra em incógnito
2. Clique "Adicionar ao Carrinho"
```

**Esperado:**
```
- Toast warning: "Por favor, faça login para adicionar ao carrinho"
- Redireciona automático para /sign
- Console: Nenhum erro
```

---

## ✨ TESTE 4: Feedback Visual

```
1. Clique "Adicionar ao Carrinho"
2. Observe o botão mudar de estado
```

**Estados Esperados:**
```
NORMAL:
[🛒 Adicionar ao Carrinho]  (preto)

CARREGANDO:
[⟳ Adicionando...]  (preto, com spinner)

SUCESSO (2 segundos):
[✓ Adicionado!]  (verde)

VOLTA AO NORMAL:
[🛒 Adicionar ao Carrinho]  (preto)
```

**Toast Notification:**
```
"✅ 2x Foundation Matte HD adicionado ao carrinho!"
```

---

## 📊 TESTE 5: Integração com CartContext

```
1. Abra DevTools → Console
2. Digitar: localStorage.getItem('cartItems')
```

**Se usar localStorage (backup):**
```
> localStorage.getItem('cartItems')
< '{"cartItems": [...]}'
```

**Se usar apenas Firestore (atual):**
```
> localStorage.getItem('cartItems')
< null (está em Firestore, não localStorage)
```

---

## 🔍 TESTE 6: Verificação de Erros

### Console deve estar LIMPO (sem erros)

```
✅ Sem "Cannot read property..."
✅ Sem "Missing or insufficient permissions"
✅ Sem "User subscription error"
✅ Sem "saveUser error"
✅ Sem "Uncaught TypeError"
```

### Console deve ter LOGS ESPERADOS

```
✅ "📡 Setting up cart subscription:"
✅ "✅ Cart updated in Firestore:"
✅ "✅ Product added to cart:"
✅ "✅ Cart data received:"
```

---

## ✔️ CHECKLIST FINAL

### Mobile Responsividade
- [ ] 375px: Layout perfeito
- [ ] 768px: Sem problemas
- [ ] 1920px: Lado-a-lado bonito
- [ ] Botão full-width em mobile
- [ ] Sem scroll horizontal
- [ ] Texto legível em todas as resoluções

### Carrinho Persistência
- [ ] Produto salvo em Firestore após adicionar
- [ ] Carrinho persiste ao recarregar
- [ ] Múltiplos produtos sincronizam
- [ ] Quantidade atualiza corretamente
- [ ] Remover funciona
- [ ] Logout + Login carrega carrinho
- [ ] Real-time sync em múltiplas abas

### Feedback Visual
- [ ] Botão muda de estado (Normal → Carregando → Sucesso)
- [ ] Toast notification aparece
- [ ] Checkmark verde após sucesso
- [ ] Spinner durante sync
- [ ] Redireciona para /sign se não logado

### Build & Performance
- [ ] `npm run build` passa sem erros
- [ ] Console limpo (sem warnings críticos)
- [ ] Sem memory leaks
- [ ] Carregamento rápido

---

## 🐛 Se Encontrar Problemas

### Carrinho não persiste
```
1. Verifique se publicou as Firestore Rules
2. Verifique se user.uid está correto
3. Verifique Firebase Console → Rules
4. Veja console logs: "❌ saveUser error"
```

### Botão não muda de estado
```
1. Verifique se tem react-toastify importado
2. Verifique se CartContext está envolvendo App
3. Veja console: erros de import
```

### Responsividade quebrada
```
1. Limpe cache (DevTools → Storage → Clear Site Data)
2. Recarregue (Ctrl+Shift+R)
3. Teste em nova janela incógnito
4. Verifique viewport width em DevTools
```

---

## 📞 Debug Rápido

```javascript
// No Console, teste:
1. Verifique user:
   > auth.currentUser
   < User { uid: "...", email: "..." }

2. Verifique cart:
   > useCart().cartItems
   < [{ nome: "...", quantity: 1 }]

3. Verifique Firestore:
   > getDoc(doc(db, "users", auth.currentUser.uid))
   < DocumentSnapshot { ..., cart: [...] }
```

---

**Testes completos = Produção pronta!** ✅
