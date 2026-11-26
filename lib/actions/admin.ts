"use server";

import { ObjectId, type Document } from "mongodb";
import { put } from "@vercel/blob";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { TAG_CONFIG, TAG_PRODUTOS } from "@/lib/data";
import { exigirAdmin } from "@/lib/sessao";
import { lerPreco, slugify } from "@/lib/format";
import { CONFIG_PADRAO, STATUS_PEDIDO, TAMANHOS, type Configuracoes, type Cor, type StatusPedido } from "@/lib/types";

export type EstadoForm = { erro: string | null; ok?: boolean };

const HEX = /^#[0-9a-fA-F]{6}$/;

// ---------- produtos ----------

export async function salvarProduto(_anterior: EstadoForm, formData: FormData): Promise<EstadoForm> {
  await exigirAdmin();

  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const estilo = String(formData.get("estilo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const tecido = String(formData.get("tecido") ?? "").trim();
  const preco = lerPreco(String(formData.get("preco") ?? ""));
  const precoOriginalTxt = String(formData.get("precoOriginal") ?? "").trim();
  const precoOriginal = precoOriginalTxt ? lerPreco(precoOriginalTxt) : null;
  const ativo = formData.get("ativo") === "on";

  if (nome.length < 3) return { erro: "Informe o nome do produto." };
  if (preco == null || preco <= 0) return { erro: "Informe um preço válido (ex.: 89,90)." };
  if (precoOriginalTxt && (precoOriginal == null || precoOriginal <= preco)) {
    return { erro: "O preço original precisa ser maior que o preço atual. Deixe em branco se não houver promoção." };
  }

  let cores: Cor[] = [];
  try {
    const bruto = JSON.parse(String(formData.get("cores") ?? "[]"));
    if (Array.isArray(bruto)) {
      cores = bruto
        .map((c) => ({ nome: String(c?.nome ?? "").trim().slice(0, 40), hex: String(c?.hex ?? "") }))
        .filter((c) => c.nome && HEX.test(c.hex));
    }
  } catch {
    return { erro: "Lista de cores inválida." };
  }
  if (cores.length === 0) return { erro: "Cadastre pelo menos uma cor." };

  const tamanhos = TAMANHOS.map((t) => {
    const n = Math.floor(Number(formData.get(`estoque_${t}`) ?? 0));
    return { tamanho: t, estoque: Number.isFinite(n) && n > 0 ? Math.min(n, 9999) : 0 };
  });

  const imagens = formData
    .getAll("imagens")
    .map(String)
    .filter((u) => /^https:\/\/[^\s]+$/.test(u))
    .slice(0, 8);

  const etiquetas = {
    novidade: formData.get("novidade") === "on",
    maisVendido: formData.get("maisVendido") === "on",
    oferta: formData.get("oferta") === "on" && precoOriginal != null,
  };

  const db = await getDb();
  const col = db.collection("produtos");

  const dados = { nome, estilo, descricao, tecido, preco, precoOriginal, cores, tamanhos, imagens, etiquetas, ativo, exemplo: false };

  if (id) {
    if (!ObjectId.isValid(id)) return { erro: "Produto inválido." };
    await col.updateOne({ _id: new ObjectId(id) }, { $set: { ...dados, atualizadoEm: new Date() } });
  } else {
    const base = slugify(nome) || "produto";
    let slug = base;
    for (let i = 2; await col.findOne({ slug }, { projection: { _id: 1 } }); i++) slug = `${base}-${i}`;
    await col.insertOne({ ...dados, slug, criadoEm: new Date() });
  }

  updateTag(TAG_PRODUTOS);
  redirect("/admin/produtos?salvo=1");
}

export async function alternarAtivo(formData: FormData) {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return;
  const db = await getDb();
  const atual = await db.collection("produtos").findOne({ _id: new ObjectId(id) }, { projection: { ativo: 1 } });
  if (!atual) return;
  await db.collection("produtos").updateOne({ _id: atual._id }, { $set: { ativo: !atual.ativo } });
  updateTag(TAG_PRODUTOS);
}

export async function excluirProduto(formData: FormData) {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  if (!ObjectId.isValid(id)) return;
  const db = await getDb();
  await db.collection("produtos").deleteOne({ _id: new ObjectId(id) });
  updateTag(TAG_PRODUTOS);
  redirect("/admin/produtos");
}

export async function enviarImagem(formData: FormData): Promise<{ url?: string; erro?: string }> {
  await exigirAdmin();
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { erro: "Upload não configurado: conecte um Blob Store na Vercel (BLOB_READ_WRITE_TOKEN)." };
  }
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: "Nenhum arquivo recebido." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) return { erro: "Use JPG, PNG ou WEBP." };
  if (arquivo.size > 4 * 1024 * 1024) return { erro: "Imagem maior que 4 MB." };
  const ext = arquivo.type.split("/")[1].replace("jpeg", "jpg");
  const blob = await put(`produtos/${Date.now()}.${ext}`, arquivo, {
    access: "public",
    addRandomSuffix: true,
    contentType: arquivo.type,
  });
  return { url: blob.url };
}

// ---------- pedidos ----------

export async function atualizarStatusPedido(formData: FormData) {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const novo = String(formData.get("status") ?? "") as StatusPedido;
  if (!ObjectId.isValid(id) || !STATUS_PEDIDO.includes(novo)) return;

  const db = await getDb();
  const pedidos = db.collection("pedidos");
  const pedido = await pedidos.findOne({ _id: new ObjectId(id) });
  if (!pedido || pedido.status === novo) return;

  // Cancelar devolve as peças ao estoque; reabrir um cancelado volta a reservar.
  const sinal = novo === "cancelado" ? 1 : pedido.status === "cancelado" ? -1 : 0;
  if (sinal !== 0) {
    const produtos = db.collection("produtos");
    for (const item of pedido.itens ?? []) {
      if (!ObjectId.isValid(item.produtoId)) continue;
      await produtos.updateOne(
        { _id: new ObjectId(item.produtoId), "tamanhos.tamanho": item.tamanho },
        { $inc: { "tamanhos.$.estoque": sinal * Number(item.qtd) } },
      );
    }
    updateTag(TAG_PRODUTOS);
  }
  await pedidos.updateOne({ _id: pedido._id }, { $set: { status: novo, atualizadoEm: new Date() } });
}

// ---------- configurações ----------

export async function salvarConfiguracoes(_anterior: EstadoForm, formData: FormData): Promise<EstadoForm> {
  await exigirAdmin();
  const dados = {} as Configuracoes;
  for (const k of Object.keys(CONFIG_PADRAO) as (keyof Configuracoes)[]) {
    dados[k] = String(formData.get(k) ?? "").trim().slice(0, 20000);
  }
  if (dados.whatsapp && dados.whatsapp.replace(/\D/g, "").length < 10) {
    return { erro: "WhatsApp inválido. Use DDD + número, ex.: (85) 99999-9999." };
  }
  if (dados.bannerUrl && !/^https:\/\//.test(dados.bannerUrl)) {
    return { erro: "Endereço da imagem do banner inválido." };
  }
  const db = await getDb();
  await db
    .collection<{ _id: string } & Document>("configuracoes")
    .updateOne({ _id: "loja" }, { $set: { ...dados, atualizadoEm: new Date() } }, { upsert: true });
  updateTag(TAG_CONFIG);
  return { erro: null, ok: true };
}
