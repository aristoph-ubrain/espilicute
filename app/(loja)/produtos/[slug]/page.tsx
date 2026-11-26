import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CartaoProduto, Preco, estoqueTotal } from "@/components/loja/cartao-produto";
import { CompraProduto } from "@/components/loja/compra-produto";
import { Galeria } from "@/components/loja/galeria";
import { getConfiguracoes, getProdutoPorSlug, getProdutosAtivos } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProdutoPorSlug(slug);
  if (!p) return { title: "Produto não encontrado" };
  const descricao = p.descricao.slice(0, 155) || `${p.nome} — Espilicute, moda feminina.`;
  return {
    title: p.nome,
    description: descricao,
    alternates: { canonical: `/produtos/${p.slug}` },
    openGraph: { title: p.nome, description: descricao, images: p.imagens.slice(0, 1) },
  };
}

export default function PaginaProduto({ params }: PageProps<"/produtos/[slug]">) {
  return (
    <div className="mx-auto w-full max-w-6xl md:px-6 md:pt-6">
      <Suspense fallback={<ProdutoCarregando />}>
        {params.then(({ slug }) => (
          <Detalhes slug={slug} />
        ))}
      </Suspense>
    </div>
  );
}

async function Detalhes({ slug }: { slug: string }) {
  const [produto, todos, config] = await Promise.all([getProdutoPorSlug(slug), getProdutosAtivos(), getConfiguracoes()]);
  if (!produto) notFound();

  const relacionados = todos
    .filter((p) => p.id !== produto.id && estoqueTotal(p) > 0)
    .sort((a, b) => Number(b.estilo === produto.estilo) - Number(a.estilo === produto.estilo))
    .slice(0, 4);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produto.nome,
    description: produto.descricao || undefined,
    image: produto.imagens.length ? produto.imagens : undefined,
    brand: { "@type": "Brand", name: "Espilicute" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (produto.preco / 100).toFixed(2),
      availability: estoqueTotal(produto) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl}/produtos/${produto.slug}`,
    },
  };

  const infos = [
    { titulo: "Descrição", texto: produto.descricao },
    { titulo: "Tecido e composição", texto: produto.tecido },
    { titulo: "Entrega", texto: config.entrega, link: "/info/entrega" },
    { titulo: "Trocas e devoluções", texto: config.trocas, link: "/info/trocas" },
  ].filter((i) => i.texto);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="md:grid md:grid-cols-2 md:gap-10">
        <Galeria produto={produto} />
        <div className="flex flex-col gap-5 px-5 pt-5 md:px-0 md:pt-0">
          <nav aria-label="Navegação estrutural" className="hidden text-xs text-apagado md:block">
            <Link href="/produtos" className="hover:underline">
              Shorts
            </Link>{" "}
            / {produto.nome}
          </nav>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[22px] font-bold leading-tight md:text-3xl">{produto.nome}</h1>
            <Preco produto={produto} grande />
            <p className="text-[13px] text-suave">Pagamento combinado pelo WhatsApp ao finalizar o pedido.</p>
          </div>

          <CompraProduto produto={produto} guiaMedidas={config.guiaMedidas} />

          {infos.length > 0 && (
            <div className="border-t border-linha">
              {infos.map((i, n) => (
                <details key={i.titulo} open={n === 0} className="group border-b border-linha py-3.5">
                  <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">
                    <span className="flex items-center justify-between">
                      {i.titulo}
                      <span aria-hidden="true" className="text-lg text-apagado group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-2.5 whitespace-pre-line text-[13px] leading-relaxed text-suave">
                    {i.link ? i.texto.slice(0, 280) + (i.texto.length > 280 ? "…" : "") : i.texto}
                  </p>
                  {i.link && i.texto.length > 280 && (
                    <Link href={i.link} className="mt-1 inline-block text-[13px] font-semibold text-vinho underline">
                      Ler tudo
                    </Link>
                  )}
                </details>
              ))}
            </div>
          )}
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="px-5 pt-10 md:px-0">
          <h2 className="mb-4 text-lg font-bold">Combina com você</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 md:gap-x-5">
            {relacionados.map((p) => (
              <CartaoProduto key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function ProdutoCarregando() {
  return (
    <div aria-busy="true" aria-label="Carregando produto" className="md:grid md:grid-cols-2 md:gap-10">
      <div className="aspect-[4/5] animate-pulse bg-blush md:rounded-2xl" />
      <div className="flex flex-col gap-3 p-5 md:p-0">
        <div className="h-7 w-2/3 animate-pulse rounded bg-blush" />
        <div className="h-7 w-28 animate-pulse rounded bg-blush" />
        <div className="mt-4 h-11 w-full animate-pulse rounded-full bg-blush" />
      </div>
    </div>
  );
}
