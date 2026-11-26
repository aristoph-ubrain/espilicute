import Image from "next/image";
import Link from "next/link";
import { ArteShort } from "@/components/icones";
import { formatarPreco, LIMITE_ULTIMAS_UNIDADES } from "@/lib/format";
import type { Produto } from "@/lib/types";

/** Clareia uma cor hex misturando com branco — fundo das ilustrações sem foto. */
export function fundoClaro(hex: string, quanto = 0.82) {
  const n = parseInt(hex.slice(1), 16);
  if (!Number.isFinite(n)) return "#f7edea";
  const mistura = (c: number) => Math.round(c + (255 - c) * quanto);
  const r = mistura((n >> 16) & 255);
  const g = mistura((n >> 8) & 255);
  const b = mistura(n & 255);
  return `rgb(${r} ${g} ${b})`;
}

export function estoqueTotal(p: Produto) {
  return p.tamanhos.reduce((s, t) => s + t.estoque, 0);
}

export function Etiqueta({ children, tom = "claro" }: { children: React.ReactNode; tom?: "claro" | "vinho" | "alerta" }) {
  const cores = {
    claro: "bg-white text-tinta",
    vinho: "bg-vinho text-white",
    alerta: "bg-white text-alerta",
  }[tom];
  return <span className={`rounded px-1.5 py-1 text-[9px] font-bold tracking-[0.08em] ${cores}`}>{children}</span>;
}

export function EtiquetasProduto({ produto }: { produto: Produto }) {
  const total = estoqueTotal(produto);
  return (
    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
      {total === 0 && <Etiqueta tom="alerta">ESGOTADO</Etiqueta>}
      {produto.etiquetas.oferta && produto.precoOriginal && <Etiqueta tom="vinho">OFERTA</Etiqueta>}
      {produto.etiquetas.novidade && <Etiqueta>NOVIDADE</Etiqueta>}
      {produto.etiquetas.maisVendido && <Etiqueta>MAIS VENDIDO</Etiqueta>}
      {total > 0 && total <= LIMITE_ULTIMAS_UNIDADES && <Etiqueta tom="alerta">ÚLTIMAS UNIDADES</Etiqueta>}
      {produto.exemplo && <Etiqueta>EXEMPLO</Etiqueta>}
    </div>
  );
}

export function Preco({ produto, grande = false }: { produto: Produto; grande?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      {produto.precoOriginal && (
        <span className={`text-apagado line-through ${grande ? "text-sm" : "text-xs"}`}>
          {formatarPreco(produto.precoOriginal)}
        </span>
      )}
      <span className={`font-bold text-vinho ${grande ? "text-2xl" : "text-sm"}`}>{formatarPreco(produto.preco)}</span>
    </div>
  );
}

export function FotoProduto({
  produto,
  indice = 0,
  sizes,
  prioridade = false,
  largura = 96,
}: {
  produto: Produto;
  indice?: number;
  sizes: string;
  prioridade?: boolean;
  largura?: number;
}) {
  const cor = produto.cores[0]?.hex ?? "#c9897b";
  const src = produto.imagens[indice];
  if (src) {
    return (
      <Image
        src={src}
        alt={`${produto.nome}${produto.imagens.length > 1 ? ` — foto ${indice + 1}` : ""}`}
        fill
        sizes={sizes}
        priority={prioridade}
        className="object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: fundoClaro(cor) }}>
      <ArteShort cor={cor} largura={largura} />
    </div>
  );
}

export function CartaoProduto({ produto }: { produto: Produto }) {
  const tamanhosDisp = produto.tamanhos.filter((t) => t.estoque > 0).map((t) => t.tamanho);
  return (
    <Link href={`/produtos/${produto.slug}`} className="group flex flex-col gap-1.5">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-blush">
        <FotoProduto produto={produto} sizes="(min-width: 1024px) 25vw, 50vw" />
        <EtiquetasProduto produto={produto} />
      </div>
      <span className="text-[13px] font-medium leading-snug group-hover:underline">{produto.nome}</span>
      {tamanhosDisp.length > 0 && <span className="text-xs text-apagado">Tam. {tamanhosDisp.join(" · ")}</span>}
      <Preco produto={produto} />
    </Link>
  );
}
