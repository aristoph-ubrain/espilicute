// Cria produtos de EXEMPLO e os índices do banco.
// Uso: npm run seed            (só cria se ainda não houver produtos)
//      npm run seed -- --force (apaga os produtos marcados como exemplo e recria)
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Defina MONGODB_URI no arquivo .env.local antes de rodar o seed.");
  process.exit(1);
}

const forcar = process.argv.includes("--force");
const client = new MongoClient(uri);

const tamanhos = (pp, p, m, g, gg) => [
  { tamanho: "PP", estoque: pp },
  { tamanho: "P", estoque: p },
  { tamanho: "M", estoque: m },
  { tamanho: "G", estoque: g },
  { tamanho: "GG", estoque: gg },
];

// Preço 0 de propósito: a loja define os valores reais no painel antes de vender.
const exemplos = [
  { slug: "short-linho-areia", nome: "Short Linho Areia", estilo: "Linho", cores: [{ nome: "Areia", hex: "#C7AE8C" }], tamanhos: tamanhos(0, 3, 5, 4, 0) },
  { slug: "short-jeans-classico", nome: "Short Jeans Clássico", estilo: "Jeans", cores: [{ nome: "Jeans", hex: "#6E86A8" }, { nome: "Jeans escuro", hex: "#3E4A63" }], tamanhos: tamanhos(2, 6, 8, 5, 3) },
  { slug: "short-alfaiataria", nome: "Short Alfaiataria", estilo: "Alfaiataria", cores: [{ nome: "Vinho", hex: "#7A2346" }, { nome: "Preto", hex: "#2B2226" }], tamanhos: tamanhos(0, 4, 2, 6, 0) },
  { slug: "short-moletom-rose", nome: "Short Moletom Rosé", estilo: "Moletom", cores: [{ nome: "Rosé", hex: "#C9897B" }], tamanhos: tamanhos(0, 0, 3, 2, 1) },
].map((p, i) => ({
  ...p,
  descricao: "",
  tecido: "",
  preco: 0,
  precoOriginal: null,
  imagens: [],
  etiquetas: { novidade: false, maisVendido: false, oferta: false },
  ativo: true,
  exemplo: true,
  criadoEm: new Date(Date.now() - i * 1000),
}));

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "espilicute");
  const produtos = db.collection("produtos");

  await produtos.createIndex({ slug: 1 }, { unique: true });
  await produtos.createIndex({ ativo: 1, criadoEm: -1 });
  await db.collection("pedidos").createIndex({ numero: 1 }, { unique: true });
  await db.collection("pedidos").createIndex({ status: 1, criadoEm: -1 });

  if (forcar) {
    const r = await produtos.deleteMany({ exemplo: true });
    console.log(`Removidos ${r.deletedCount} produtos de exemplo.`);
  }

  if ((await produtos.countDocuments()) > 0 && !forcar) {
    console.log("Já existem produtos no banco. Nada foi alterado (use --force para recriar os exemplos).");
  } else {
    await produtos.insertMany(exemplos);
    console.log(`Criados ${exemplos.length} produtos de exemplo (preço R$ 0,00 — edite no painel).`);
  }

  await db
    .collection("configuracoes")
    .updateOne({ _id: "loja" }, { $setOnInsert: { avisoTopo: "Peça pelo WhatsApp em poucos cliques" } }, { upsert: true });

  console.log("Pronto.");
} catch (err) {
  console.error("Erro no seed:", err.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
