# Djay Cosméticos - Maison de Beauté

E-commerce de cosméticos angolano com backend Appwrite, animações Three.js/GSAP e checkout via WhatsApp.

## 🚀 Stack

- **Frontend:** React 19 + Vite (rolldown-vite) + Tailwind CSS v4
- **Animações:** Three.js, GSAP, Framer Motion
- **Backend:** Appwrite (Auth, Database, Storage)
- **Checkout:** WhatsApp

## ⚙️ Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencha as variáveis no .env

# 3. Desenvolvimento
npm run dev

# 4. Build produção
npm run build
```

## 🌍 Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `VITE_APPWRITE_ENDPOINT` | Endpoint do Appwrite |
| `VITE_APPWRITE_PROJECT_ID` | ID do projeto Appwrite |
| `VITE_APPWRITE_ID_DATABASE` | ID da database |
| `VITE_APPWRITE_ID_BUCKET` | ID do bucket de storage |
| `VITE_APPWRITE_API_KEY` | Chave de API (para scripts) |
| `VITE_ADMIN_EMAIL` | Email do administrador |
| `VITE_WHATSAPP_NUMBER` | Número WhatsApp (formato internacional, sem +) |

## 📦 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |

## 🗄️ Provisionamento Appwrite

Os scripts em `provision-db.js` e `provision-storage.js` criam as coleções/bucket necessários:

```bash
node provision-db.js
node provision-storage.js
node scripts/set-admin.js
```
