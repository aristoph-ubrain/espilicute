"use client";

import { useState } from "react";
import { EtiquetasProduto, FotoProduto } from "./cartao-produto";
import type { Produto } from "@/lib/types";

export function Galeria({ produto }: { produto: Produto }) {
  const [atual, setAtual] = useState(0);
  const total = Math.max(1, produto.imagens.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-blush md:rounded-2xl">
        <FotoProduto produto={produto} indice={atual} sizes="(min-width: 768px) 50vw, 100vw" prioridade largura={220} />
        <EtiquetasProduto produto={produto} />
        {total > 1 && (
          <div className="absolute inset-x-0 bottom-1 flex justify-center md:hidden">
            {produto.imagens.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === atual ? "true" : undefined}
                onClick={() => setAtual(i)}
                className="flex h-11 w-9 items-center justify-center"
              >
                <span className={`block h-2 rounded-full transition-all ${i === atual ? "w-5 bg-vinho" : "w-2 bg-white/80"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
      {total > 1 && (
        <div className="hidden gap-2 md:flex">
          {produto.imagens.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === atual ? "true" : undefined}
              onClick={() => setAtual(i)}
              className={`relative h-24 w-20 overflow-hidden rounded-lg border-2 ${i === atual ? "border-vinho" : "border-transparent"}`}
            >
              <FotoProduto produto={produto} indice={i} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
