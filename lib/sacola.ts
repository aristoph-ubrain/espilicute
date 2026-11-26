"use client";

import { useSyncExternalStore } from "react";
import type { ItemSacola } from "./types";

/** Sacola guardada no navegador (localStorage), compartilhada entre abas. */
const CHAVE = "espilicute:sacola:v1";
const VAZIA: ItemSacola[] = [];
/** Disparado ao adicionar um item (usado para animar o ícone da sacola). */
export const EVENTO_ADICIONADO = "espilicute:sacola-adicionado";

let itens: ItemSacola[] = VAZIA;
let carregada = false;
const ouvintes = new Set<() => void>();

function ler(): ItemSacola[] {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const lista = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function avisar() {
  ouvintes.forEach((f) => f());
}

function gravar(nova: ItemSacola[]) {
  itens = nova;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(nova));
  } catch {
    // modo privado ou armazenamento cheio: a sacola continua em memória
  }
  avisar();
}

function assinar(f: () => void) {
  ouvintes.add(f);
  const aoMudarEmOutraAba = (e: StorageEvent) => {
    if (e.key === CHAVE) {
      itens = ler();
      avisar();
    }
  };
  window.addEventListener("storage", aoMudarEmOutraAba);
  return () => {
    ouvintes.delete(f);
    window.removeEventListener("storage", aoMudarEmOutraAba);
  };
}

function snapshot() {
  if (!carregada) {
    itens = ler();
    carregada = true;
  }
  return itens;
}

export function useSacola() {
  return useSyncExternalStore(assinar, snapshot, () => VAZIA);
}

function mesmaLinha(a: ItemSacola, b: Pick<ItemSacola, "produtoId" | "cor" | "tamanho">) {
  return a.produtoId === b.produtoId && a.cor === b.cor && a.tamanho === b.tamanho;
}

export function adicionarItem(novo: ItemSacola) {
  const atual = snapshot();
  const existente = atual.find((i) => mesmaLinha(i, novo));
  gravar(
    existente
      ? atual.map((i) => (mesmaLinha(i, novo) ? { ...i, qtd: Math.min(20, i.qtd + novo.qtd) } : i))
      : [...atual, novo],
  );
  window.dispatchEvent(new Event(EVENTO_ADICIONADO));
}

export function alterarQtd(alvo: Pick<ItemSacola, "produtoId" | "cor" | "tamanho">, qtd: number) {
  gravar(snapshot().map((i) => (mesmaLinha(i, alvo) ? { ...i, qtd: Math.max(1, Math.min(20, qtd)) } : i)));
}

export function removerItem(alvo: Pick<ItemSacola, "produtoId" | "cor" | "tamanho">) {
  gravar(snapshot().filter((i) => !mesmaLinha(i, alvo)));
}

export function limparSacola() {
  gravar([]);
}

export function totalDeItens(lista: ItemSacola[]) {
  return lista.reduce((s, i) => s + i.qtd, 0);
}
