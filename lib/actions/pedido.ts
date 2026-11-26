"use server";

import { ObjectId } from "mongodb";
import { updateTag } from "next/cache";
import { getDb } from "@/lib/db";
import { TAG_PRODUTOS, getConfiguracoes } from "@/lib/data";
import { formatarPreco, linkWhatsapp } from "@/lib/format";
import { TAMANHOS, type ItemPedido, type Tamanho } from "@/lib/types";

export type EntradaPedido = {
  itens: { produtoId: string; cor: string; tamanho: string; qtd: number }[];
  nome: string;
  local: string;
  entrega: "entrega" | "retirada";
};

export type ResultadoPedido =
  | { ok: true; numero: number; whatsappUrl: string }
  | { ok: false; erro: string; produtoId?: string };

/**
 * Registra o pedido com preços e estoque lidos do banco (nunca confia nos valores do navegador),
 * reserva as peças e devolve o link do WhatsApp com a mensagem pronta.
 */
export async function criarPedido(entrada: EntradaPedido): Promise<ResultadoPedido> {
  const nome = String(entrada?.nome ?? "").trim().slice(0, 80);
  const local = String(entrada?.local ?? "").trim().slice(0, 120);
  const entrega = entrada?.entrega === "retirada" ? "retirada" : "entrega";
  const itensEntrada = Array.isArray(entrada?.itens) ? entrada.itens.slice(0, 30) : [];

  if (nome.length < 2) return { ok: false, erro: "Informe seu nome." };
  if (entrega === "entrega" && local.length < 3) return { ok: false, erro: "Informe bairro e cidade para a entrega." };
  if (itensEntrada.length === 0) return { ok: false, erro: "Sua sacola está vazia." };

  const config = await getConfiguracoes();
  if (!config.whatsapp) return { ok: false, erro: "A loja ainda não configurou o WhatsApp de atendimento." };

  const db = await getDb();
  const produtos = db.collection("produtos");

  // Agrupa itens repetidos e valida formato
  const agrupado = new Map<string, { produtoId: string; cor: string; tamanho: Tamanho; qtd: number }>();
  for (const i of itensEntrada) {
    const tamanho = String(i?.tamanho) as Tamanho;
    const qtd = Math.floor(Number(i?.qtd));
    if (!ObjectId.isValid(String(i?.produtoId)) || !TAMANHOS.includes(tamanho) || !(qtd >= 1 && qtd <= 20)) {
      return { ok: false, erro: "Há um item inválido na sacola." };
    }
    const chave = `${i.produtoId}|${i.cor}|${tamanho}`;
    const atual = agrupado.get(chave);
    agrupado.set(chave, { produtoId: String(i.produtoId), cor: String(i.cor).slice(0, 40), tamanho, qtd: (atual?.qtd ?? 0) + qtd });
  }

  const itens: ItemPedido[] = [];
  for (const i of agrupado.values()) {
    const p = await produtos.findOne({ _id: new ObjectId(i.produtoId), ativo: true });
    if (!p) return { ok: false, erro: "Um produto da sacola não está mais disponível.", produtoId: i.produtoId };
    if (!(Number(p.preco) > 0)) {
      return { ok: false, erro: `"${p.nome}" ainda está sem preço definido pela loja.`, produtoId: i.produtoId };
    }
    if (!(p.cores ?? []).some((c: { nome: string }) => c.nome === i.cor)) {
      return { ok: false, erro: `A cor escolhida de "${p.nome}" não está mais disponível.`, produtoId: i.produtoId };
    }
    itens.push({ produtoId: i.produtoId, nome: String(p.nome), cor: i.cor, tamanho: i.tamanho, qtd: i.qtd, preco: Number(p.preco) });
  }

  // Reserva o estoque item a item; desfaz se algum faltar.
  const reservados: ItemPedido[] = [];
  for (const item of itens) {
    const r = await produtos.updateOne(
      {
        _id: new ObjectId(item.produtoId),
        tamanhos: { $elemMatch: { tamanho: item.tamanho, estoque: { $gte: item.qtd } } },
      },
      { $inc: { "tamanhos.$.estoque": -item.qtd } },
    );
    if (r.modifiedCount === 0) {
      for (const desfazer of reservados) {
        await produtos.updateOne(
          { _id: new ObjectId(desfazer.produtoId), "tamanhos.tamanho": desfazer.tamanho },
          { $inc: { "tamanhos.$.estoque": desfazer.qtd } },
        );
      }
      return {
        ok: false,
        erro: `Não temos ${item.qtd} unidade(s) de "${item.nome}" no tamanho ${item.tamanho}. Ajuste a quantidade.`,
        produtoId: item.produtoId,
      };
    }
    reservados.push(item);
  }

  const subtotal = itens.reduce((s, i) => s + i.preco * i.qtd, 0);
  const contador = await db
    .collection<{ _id: string; valor: number }>("contadores")
    .findOneAndUpdate({ _id: "pedidos" }, { $inc: { valor: 1 } }, { upsert: true, returnDocument: "after" });
  const numero = contador?.valor ?? Date.now();

  await db.collection("pedidos").insertOne({
    numero,
    itens,
    subtotal,
    cliente: { nome, local },
    entrega,
    status: "novo",
    criadoEm: new Date(),
  });
  updateTag(TAG_PRODUTOS);

  const linhas = itens.map((i) => `• ${i.qtd}x ${i.nome} — ${i.cor}, tam. ${i.tamanho} (${formatarPreco(i.preco * i.qtd)})`);
  const mensagem = [
    `Olá, Espilicute! Sou ${nome} e quero fazer o pedido #${numero}:`,
    ...linhas,
    "",
    `Subtotal: ${formatarPreco(subtotal)}`,
    entrega === "entrega" ? `Entrega em: ${local}` : "Vou retirar o pedido",
  ].join("\n");

  return { ok: true, numero, whatsappUrl: linkWhatsapp(config.whatsapp, mensagem) };
}
