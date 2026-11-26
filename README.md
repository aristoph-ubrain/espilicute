# Espilicute — loja virtual (MVP)

Loja de moda feminina (shorts) feita com **Next.js 16**, **MongoDB Atlas** e deploy na **Vercel**.
Pedidos são finalizados pelo **WhatsApp**: a cliente monta a sacola, o pedido é registrado no banco
(com preço e estoque conferidos no servidor) e o WhatsApp abre com a mensagem pronta.

## O que tem no MVP

**Loja** (mobile first)
- Início: barra de aviso, banner, compra por estilo, destaques, benefícios
- Catálogo `/produtos`: busca, filtros por tamanho, cor e estilo, ordenação
- Produto `/produtos/[slug]`: galeria, cor, tamanho (esgotado riscado), quantidade, guia de medidas, relacionados, dados estruturados (SEO)
- Sacola `/sacola`: alterar/remover itens, nome + bairro ou retirada, prévia da mensagem, finalizar pelo WhatsApp
- Páginas institucionais `/info/[sobre|entrega|trocas|privacidade|termos|faq|contato]` — textos editados no painel
- `sitemap.xml`, `robots.txt`, metadados e Open Graph

**Painel** `/admin` (protegido por senha)
- Produtos: cadastrar, editar, ocultar/publicar, excluir, fotos (Vercel Blob), cores, estoque por tamanho, etiquetas
- Pedidos: lista com filtro por status; cancelar devolve as peças ao estoque
- Configurações: WhatsApp, Instagram, banner, aviso do topo, dados da empresa, políticas e guia de medidas

Etiquetas seguem a regra do projeto: *Novidade*, *Mais vendido* e *Oferta* são marcadas manualmente
(Oferta só aparece com preço original real); *Últimas unidades* e *Esgotado* vêm do estoque.

## Configuração

1. **Instale as dependências** (gera o `package-lock.json` atualizado):
   ```bash
   npm install
   ```
2. **Crie o banco no MongoDB Atlas** (plano gratuito serve). Em *Network Access*, libere `0.0.0.0/0`
   (necessário para a Vercel). Copie a connection string em *Connect > Drivers*.
3. **Variáveis de ambiente**: copie `.env.example` para `.env.local` e preencha.
4. **Dados de exemplo** (opcional): `npm run seed` cria 4 shorts de exemplo com preço R$ 0,00 —
   edite ou exclua no painel antes de abrir a loja.
5. **Rodar**: `npm run dev` e abra http://localhost:3000 — painel em http://localhost:3000/admin
6. Entre no painel > **Configurações** e cadastre o **WhatsApp** que recebe os pedidos.

### Deploy na Vercel

1. Importe o repositório na Vercel.
2. Em *Storage*, crie um **Blob Store** e conecte ao projeto (cria `BLOB_READ_WRITE_TOKEN`).
3. Em *Settings > Environment Variables*, cadastre `MONGODB_URI`, `MONGODB_DB`, `ADMIN_PASSWORD`,
   `SESSION_SECRET` e `NEXT_PUBLIC_SITE_URL` (o domínio final, ex.: `https://espilicute.com.br`).
4. Faça o deploy. O build precisa acessar o banco (as páginas públicas são pré-renderizadas).

## Estrutura

```
app/
  (loja)/            páginas públicas (layout com aviso, cabeçalho e rodapé)
  admin/login        login do painel
  admin/(painel)/    produtos, pedidos, configurações (exige sessão)
components/
  loja/              cabeçalho, cartão de produto, galeria, compra, sacola
  admin/             formulários do painel e envio de fotos
lib/
  data.ts            leituras do banco ('use cache' + tags para a loja; sem cache no painel)
  actions/           Server Actions: pedido (público), admin, login
  auth.ts sessao.ts  sessão do painel (cookie assinado HMAC)
  sacola.ts          sacola no navegador (localStorage)
proxy.ts             redireciona /admin para o login sem sessão
scripts/seed.mjs     produtos de exemplo e índices
```

## Cache

O projeto usa **Cache Components** (`cacheComponents: true`). Produtos e configurações são lidos com
`'use cache'` e as tags `produtos` / `config`; toda alteração feita no painel chama `updateTag`, então a
loja reflete a mudança na hora.

## Próximos passos sugeridos

- Pagamento online (Mercado Pago: Pix, cartão, boleto)
- Cálculo de frete por CEP
- Estoque por cor + tamanho (hoje o estoque é por tamanho)
- Avaliações de clientes reais
- Meta Pixel / Google Analytics 4
