import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { IconeBusca } from "@/components/icones";
import { CartaoProduto, estoqueTotal } from "@/components/loja/cartao-produto";
import { getProdutosAtivos } from "@/lib/data";
import { TAMANHOS, type Produto } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shorts femininos",
  description: "Todos os shorts da Espilicute. Filtre por tamanho, cor e estilo.",
};

type Filtros = { tamanho?: string; cor?: string; estilo?: string; ordem?: string; q?: string };

const ORDENS = [
  { valor: "novidades", rotulo: "Novidades" },
  { valor: "menor-preco", rotulo: "Menor preço" },
  { valor: "maior-preco", rotulo: "Maior preço" },
];

function texto(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v)?.slice(0, 60) || undefined;
}

function normal(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function filtrar(produtos: Produto[], f: Filtros) {
  let lista = produtos.filter((p) => {
    if (f.tamanho && !p.tamanhos.some((t) => t.tamanho === f.tamanho && t.estoque > 0)) return false;
    if (f.cor && !p.cores.some((c) => c.nome === f.cor)) return false;
    if (f.estilo && p.estilo !== f.estilo) return false;
    if (f.q && !normal(`${p.nome} ${p.estilo} ${p.cores.map((c) => c.nome).join(" ")}`).includes(normal(f.q))) return false;
    return true;
  });
  if (f.ordem === "menor-preco") lista = [...lista].sort((a, b) => a.preco - b.preco);
  else if (f.ordem === "maior-preco") lista = [...lista].sort((a, b) => b.preco - a.preco);
  // Esgotados vão para o fim, sem esconder
  return [...lista].sort((a, b) => Number(estoqueTotal(a) === 0) - Number(estoqueTotal(b) === 0));
}

function urlCom(f: Filtros, muda: Partial<Filtros>) {
  const p = new URLSearchParams();
  const final = { ...f, ...muda };
  for (const [k, v] of Object.entries(final)) if (v) p.set(k, v);
  const qs = p.toString();
  return qs ? `/produtos?${qs}` : "/produtos";
}

export default function Catalogo({ searchParams }: PageProps<"/produtos">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-6 md:px-6">
      <Suspense fallback={<CatalogoCarregando />}>
        <Resultados searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Resultados({ searchParams }: Pick<PageProps<"/produtos">, "searchParams">) {
  const sp = await searchParams;
  const f: Filtros = {
    tamanho: texto(sp.tamanho),
    cor: texto(sp.cor),
    estilo: texto(sp.estilo),
    ordem: texto(sp.ordem),
    q: texto(sp.q),
  };
  const todos = await getProdutosAtivos();
  const lista = filtrar(todos, f);
  const cores = Array.from(new Map(todos.flatMap((p) => p.cores).map((c) => [c.nome, c.hex])).entries());
  const estilos = Array.from(new Set(todos.map((p) => p.estilo).filter(Boolean)));
  const temFiltro = Boolean(f.tamanho || f.cor || f.estilo || f.q);

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">{f.estilo ? `Shorts ${f.estilo}` : "Shorts"}</h1>
        <p className="mt-1 text-[13px] text-suave">
          {lista.length === 1 ? "1 produto" : `${lista.length} produtos`}
        </p>
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:gap-10">
        <aside className="flex flex-col gap-4 md:w-60 md:flex-none">
          <form action="/produtos" className="flex flex-col gap-4">
            {f.tamanho && <input type="hidden" name="tamanho" value={f.tamanho} />}
            {f.cor && <input type="hidden" name="cor" value={f.cor} />}
            {f.estilo && <input type="hidden" name="estilo" value={f.estilo} />}
            <label className="flex h-[46px] items-center gap-2.5 rounded-xl border border-borda px-3.5 text-apagado focus-within:border-vinho">
              <IconeBusca tamanho={18} />
              <input
                type="search"
                name="q"
                defaultValue={f.q}
                // A lupa do cabeçalho abre /produtos?buscar=1 com o cursor já no campo
                autoFocus={texto(sp.buscar) === "1"}
                placeholder="Buscar shorts"
                aria-label="Buscar shorts"
                className="min-w-0 flex-1 bg-transparent text-sm text-tinta outline-none"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-[13px] text-suave">
              Ordenar
              <select
                name="ordem"
                defaultValue={f.ordem ?? "novidades"}
                className="h-10 rounded-lg border border-borda bg-white px-2.5 text-[13px] text-tinta"
              >
                {ORDENS.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="h-11 rounded-full border-[1.5px] border-vinho text-[13px] font-bold text-vinho hover:bg-blush"
            >
              Aplicar
            </button>
          </form>

          <GrupoFiltro titulo="TAMANHO">
            {TAMANHOS.map((t) => (
              <Pilula key={t} href={urlCom(f, { tamanho: f.tamanho === t ? undefined : t })} ativa={f.tamanho === t}>
                {t}
              </Pilula>
            ))}
          </GrupoFiltro>

          {cores.length > 0 && (
            <GrupoFiltro titulo="COR">
              {cores.map(([nome, hex]) => (
                <Link
                  key={nome}
                  href={urlCom(f, { cor: f.cor === nome ? undefined : nome })}
                  aria-label={nome}
                  aria-current={f.cor === nome ? "true" : undefined}
                  title={nome}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${f.cor === nome ? "border-vinho" : "border-transparent"}`}
                >
                  <span className="block h-7 w-7 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" style={{ background: hex }} />
                </Link>
              ))}
            </GrupoFiltro>
          )}

          {estilos.length > 1 && (
            <GrupoFiltro titulo="ESTILO">
              {estilos.map((e) => (
                <Pilula key={e} href={urlCom(f, { estilo: f.estilo === e ? undefined : e })} ativa={f.estilo === e}>
                  {e}
                </Pilula>
              ))}
            </GrupoFiltro>
          )}

          {temFiltro && (
            <Link href={urlCom({}, { ordem: f.ordem })} className="text-[13px] font-semibold text-vinho underline">
              Limpar filtros
            </Link>
          )}
        </aside>

        <section className="flex-1">
          {lista.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-3 lg:gap-x-5">
              {lista.map((p) => (
                <CartaoProduto key={p.id} produto={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-blush p-6 text-center text-sm leading-relaxed text-suave">
              {todos.length === 0 ? (
                "Ainda não há produtos cadastrados."
              ) : (
                <>
                  Nenhum short com esses filtros.
                  <br />
                  Tente outro tamanho ou cor.
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function GrupoFiltro({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold tracking-[0.08em] text-suave">{titulo}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pilula({ href, ativa, children }: { href: string; ativa: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={ativa ? "true" : undefined}
      className={`flex h-11 min-w-12 items-center justify-center rounded-full border-[1.5px] px-3 text-[13px] font-semibold ${
        ativa ? "border-vinho bg-vinho text-white" : "border-borda bg-white text-tinta hover:border-vinho"
      }`}
    >
      {children}
    </Link>
  );
}

function CatalogoCarregando() {
  return (
    <div aria-busy="true" aria-label="Carregando produtos">
      <div className="mb-5 h-8 w-32 animate-pulse rounded bg-blush" />
      <div className="grid grid-cols-2 gap-3 md:ml-[280px] lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-blush" />
        ))}
      </div>
    </div>
  );
}
