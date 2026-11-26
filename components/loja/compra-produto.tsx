"use client";

import Link from "next/link";
import { useState } from "react";
import { LIMITE_ULTIMAS_UNIDADES } from "@/lib/format";
import { adicionarItem } from "@/lib/sacola";
import type { Produto, Tamanho } from "@/lib/types";

export function CompraProduto({ produto, guiaMedidas }: { produto: Produto; guiaMedidas?: string }) {
  const [cor, setCor] = useState(produto.cores[0]?.nome ?? "");
  const [tamanho, setTamanho] = useState<Tamanho | null>(null);
  const [qtd, setQtd] = useState(1);
  const [aviso, setAviso] = useState<string | null>(null);
  const [adicionado, setAdicionado] = useState(false);
  const [guiaAberto, setGuiaAberto] = useState(false);

  const estoque = (t: Tamanho) => produto.tamanhos.find((x) => x.tamanho === t)?.estoque ?? 0;
  const esgotado = produto.tamanhos.every((t) => t.estoque === 0);
  const maximo = tamanho ? Math.min(estoque(tamanho), 20) : 20;
  const corHex = produto.cores.find((c) => c.nome === cor)?.hex ?? "#c9897b";

  function adicionar() {
    if (!tamanho) {
      setAviso("Escolha um tamanho para continuar.");
      return;
    }
    adicionarItem({
      produtoId: produto.id,
      slug: produto.slug,
      nome: produto.nome,
      cor,
      corHex,
      tamanho,
      qtd: Math.min(qtd, maximo),
      preco: produto.preco,
      imagem: produto.imagens[0] ?? null,
    });
    setAviso(null);
    setAdicionado(true);
  }

  if (esgotado) {
    return <p className="rounded-xl bg-blush p-4 text-sm font-semibold text-alerta">Produto esgotado no momento.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {produto.cores.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[13px] text-suave">
            Cor: <strong className="text-tinta">{cor}</strong>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {produto.cores.map((c) => (
              <button
                key={c.nome}
                type="button"
                aria-label={c.nome}
                aria-pressed={cor === c.nome}
                onClick={() => {
                  setCor(c.nome);
                  setAdicionado(false);
                }}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors active:scale-95 ${cor === c.nome ? "border-vinho" : "border-transparent"}`}
              >
                <span className="block h-[30px] w-[30px] rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" style={{ background: c.hex }} />
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <legend className="text-[13px] text-suave">
            Tamanho: <strong className="text-tinta">{tamanho ?? "escolha"}</strong>
          </legend>
          {guiaMedidas && (
            <button
              type="button"
              onClick={() => setGuiaAberto((v) => !v)}
              aria-expanded={guiaAberto}
              className="h-11 text-[13px] font-semibold text-vinho underline"
            >
              Guia de medidas
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {produto.tamanhos.map(({ tamanho: t, estoque: e }) => (
            <button
              key={t}
              type="button"
              disabled={e === 0}
              aria-pressed={tamanho === t}
              aria-label={e === 0 ? `${t}, esgotado` : t}
              onClick={() => {
                setTamanho(t);
                setQtd((q) => Math.min(q, e));
                setAviso(null);
                setAdicionado(false);
              }}
              className={`h-11 min-w-[52px] rounded-full border-[1.5px] px-3 text-[13px] font-semibold transition-colors active:scale-95 ${
                e === 0
                  ? "cursor-not-allowed border-dashed border-borda text-[#a0959a] line-through"
                  : tamanho === t
                    ? "border-vinho bg-vinho text-white"
                    : "border-borda bg-white hover:border-vinho"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {guiaAberto && guiaMedidas && (
          <p className="whitespace-pre-line rounded-xl border border-linha p-3 text-[13px] leading-relaxed text-suave">{guiaMedidas}</p>
        )}
        {tamanho && estoque(tamanho) <= LIMITE_ULTIMAS_UNIDADES && (
          <p className="text-xs font-semibold text-alerta">
            {estoque(tamanho) === 1 ? "Última unidade neste tamanho" : `Últimas ${estoque(tamanho)} unidades neste tamanho`}
          </p>
        )}
      </fieldset>

      <div className="flex items-stretch gap-2.5">
        <div className="flex items-center rounded-full border-[1.5px] border-borda">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            onClick={() => setQtd((q) => Math.max(1, q - 1))}
            className="h-12 w-11 text-xl"
          >
            −
          </button>
          <span className="min-w-5 text-center font-bold" aria-live="polite">
            {qtd}
          </span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            onClick={() => setQtd((q) => Math.min(maximo, q + 1))}
            className="h-12 w-11 text-xl"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={adicionar}
          className="pressionar flex-1 rounded-full bg-vinho text-[13px] font-bold tracking-wider text-white hover:bg-vinho-escuro"
        >
          ADICIONAR À SACOLA
        </button>
      </div>

      <div aria-live="polite">
        {aviso && (
          <p role="alert" className="surgir -mt-2 text-[13px] font-semibold text-alerta">
            {aviso}
          </p>
        )}
        {adicionado && (
          <div className="surgir -mt-1 flex items-center justify-between gap-3 rounded-xl bg-blush px-4 py-3 text-[13px]">
            <span className="font-semibold">Adicionado à sacola!</span>
            <Link href="/sacola" className="font-bold text-vinho underline">
              Ver sacola
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
