"use client";

import { useRef, useState } from "react";
import { EtiquetasProduto, FotoProduto } from "./cartao-produto";
import type { Produto } from "@/lib/types";

/** Celular: fotos deslizam com o dedo. Desktop: foto grande + miniaturas. */
export function Galeria({ produto }: { produto: Produto }) {
  const [atual, setAtual] = useState(0);
  const trilho = useRef<HTMLDivElement>(null);
  const indices = produto.imagens.length > 0 ? produto.imagens.map((_, i) => i) : [0];
  const varias = indices.length > 1;

  function irPara(i: number) {
    setAtual(i);
    const el = trilho.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  function aoRolar() {
    const el = trilho.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== atual) setAtual(i);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Celular */}
      <div className="relative md:hidden">
        <div
          ref={trilho}
          onScroll={aoRolar}
          className="sem-barra flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto bg-blush"
          aria-label="Fotos do produto"
        >
          {indices.map((i) => (
            <div key={i} className="relative h-full w-full flex-none snap-center">
              <FotoProduto produto={produto} indice={i} sizes="100vw" prioridade={i === 0} largura={220} />
            </div>
          ))}
        </div>
        <EtiquetasProduto produto={produto} />
        {varias && (
          <div className="absolute inset-x-0 bottom-1 flex justify-center">
            {indices.map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === atual ? "true" : undefined}
                onClick={() => irPara(i)}
                className="flex h-11 w-8 items-center justify-center"
              >
                <span
                  className={`block h-2 rounded-full shadow-sm transition-all duration-300 ${i === atual ? "w-5 bg-vinho" : "w-2 bg-white/90"}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-2xl bg-blush md:block">
        {indices.map((i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${i === atual ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={i !== atual}
          >
            <FotoProduto produto={produto} indice={i} sizes="50vw" prioridade={i === 0} largura={220} />
          </div>
        ))}
        <EtiquetasProduto produto={produto} />
      </div>
      {varias && (
        <div className="hidden gap-2 md:flex">
          {indices.map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === atual ? "true" : undefined}
              onClick={() => setAtual(i)}
              onMouseEnter={() => setAtual(i)}
              className={`relative h-24 w-20 overflow-hidden rounded-lg border-2 transition-colors ${i === atual ? "border-vinho" : "border-transparent hover:border-borda"}`}
            >
              <FotoProduto produto={produto} indice={i} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
