import "server-only";
import { ObjectId, type WithId, type Document } from "mongodb";
import { cacheLife, cacheTag } from "next/cache";
import { bancoConfigurado, getDb } from "./db";
import {
  CONFIG_PADRAO,
  TAMANHOS,
  type Configuracoes,
  type Pedido,
  type Produto,
  type StatusPedido,
  type Tamanho,
} from "./types";

export const TAG_PRODUTOS = "produtos";
export const TAG_CONFIG = "config";

// ---------- conversão documento -> objeto serializável ----------

export function paraProduto(doc: WithId<Document>): Produto {
  const tamanhos = TAMANHOS.map((t) => {
    const achado = (doc.tamanhos ?? []).find((x: { tamanho: Tamanho }) => x.tamanho === t);
    return { tamanho: t, estoque: Number(achado?.estoque ?? 0) };
  });
  return {
    id: doc._id.toString(),
    slug: String(doc.slug ?? ""),
    nome: String(doc.nome ?? ""),
    estilo: String(doc.estilo ?? ""),
    descricao: String(doc.descricao ?? ""),
    tecido: String(doc.tecido ?? ""),
    preco: Number(doc.preco ?? 0),
    precoOriginal: doc.precoOriginal == null ? null : Number(doc.precoOriginal),
    cores: Array.isArray(doc.cores) ? doc.cores.map((c: { nome: string; hex: string }) => ({ nome: String(c.nome), hex: String(c.hex) })) : [],
    tamanhos,
    imagens: Array.isArray(doc.imagens) ? doc.imagens.map(String) : [],
    etiquetas: {
      novidade: Boolean(doc.etiquetas?.novidade),
      maisVendido: Boolean(doc.etiquetas?.maisVendido),
      oferta: Boolean(doc.etiquetas?.oferta),
    },
    ativo: Boolean(doc.ativo),
    exemplo: Boolean(doc.exemplo),
    criadoEm: (doc.criadoEm instanceof Date ? doc.criadoEm : new Date(0)).toISOString(),
  };
}

function paraPedido(doc: WithId<Document>): Pedido {
  return {
    id: doc._id.toString(),
    numero: Number(doc.numero),
    itens: doc.itens ?? [],
    subtotal: Number(doc.subtotal ?? 0),
    cliente: { nome: String(doc.cliente?.nome ?? ""), local: String(doc.cliente?.local ?? "") },
    entrega: doc.entrega === "retirada" ? "retirada" : "entrega",
    status: doc.status as StatusPedido,
    criadoEm: (doc.criadoEm instanceof Date ? doc.criadoEm : new Date(0)).toISOString(),
  };
}

// ---------- leituras públicas (em cache, invalidadas pelo painel) ----------

/** Todos os produtos ativos. O catálogo inicial é pequeno, então filtros são feitos em memória. */
export async function getProdutosAtivos(): Promise<Produto[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_PRODUTOS);
  if (!bancoConfigurado()) return [];
  const db = await getDb();
  const docs = await db.collection("produtos").find({ ativo: true }).sort({ criadoEm: -1 }).toArray();
  return docs.map(paraProduto);
}

export async function getProdutoPorSlug(slug: string): Promise<Produto | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_PRODUTOS);
  if (!bancoConfigurado()) return null;
  const db = await getDb();
  const doc = await db.collection("produtos").findOne({ slug, ativo: true });
  return doc ? paraProduto(doc) : null;
}

export async function getConfiguracoes(): Promise<Configuracoes> {
  "use cache";
  cacheLife("days");
  cacheTag(TAG_CONFIG);
  if (!bancoConfigurado()) return CONFIG_PADRAO;
  const db = await getDb();
  const doc = await db.collection<{ _id: string } & Document>("configuracoes").findOne({ _id: "loja" });
  const salvo: Partial<Configuracoes> = {};
  if (doc) {
    for (const k of Object.keys(CONFIG_PADRAO) as (keyof Configuracoes)[]) {
      if (typeof doc[k] === "string") salvo[k] = doc[k];
    }
  }
  return { ...CONFIG_PADRAO, ...salvo };
}

// ---------- leituras do painel (sempre atuais, sem cache) ----------

export async function adminListarProdutos(): Promise<Produto[]> {
  const db = await getDb();
  const docs = await db.collection("produtos").find({}).sort({ criadoEm: -1 }).toArray();
  return docs.map(paraProduto);
}

export async function adminGetProduto(id: string): Promise<Produto | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection("produtos").findOne({ _id: new ObjectId(id) });
  return doc ? paraProduto(doc) : null;
}

export async function adminListarPedidos(status?: StatusPedido): Promise<Pedido[]> {
  const db = await getDb();
  const filtro = status ? { status } : {};
  const docs = await db.collection("pedidos").find(filtro).sort({ criadoEm: -1 }).limit(200).toArray();
  return docs.map(paraPedido);
}
