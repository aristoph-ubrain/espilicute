import Image from "next/image";
import Link from "next/link";
import { Revelar } from "@/components/efeitos/revelar";
import { ArteShort, IconeConversa, IconeEntrega, IconeTroca } from "@/components/icones";
import { CartaoProduto, fundoClaro } from "@/components/loja/cartao-produto";
import { getConfiguracoes, getProdutosAtivos } from "@/lib/data";

export default async function Inicio() {
  const [produtos, config] = await Promise.all([getProdutosAtivos(), getConfiguracoes()]);
  const destaques = [
    ...produtos.filter((p) => p.etiquetas.maisVendido || p.etiquetas.novidade),
    ...produtos.filter((p) => !p.etiquetas.maisVendido && !p.etiquetas.novidade),
  ].slice(0, 8);

  // Um círculo por estilo: foto do produto mais recente com foto, senão o desenho na cor do estilo.
  const porEstilo = new Map<string, { hex: string; foto: string | null }>();
  for (const p of produtos) {
    if (!p.estilo) continue;
    const atual = porEstilo.get(p.estilo);
    if (!atual) porEstilo.set(p.estilo, { hex: p.cores[0]?.hex ?? "#c9897b", foto: p.imagens[0] ?? null });
    else if (!atual.foto && p.imagens[0]) atual.foto = p.imagens[0];
  }
  const estilos = Array.from(porEstilo.entries()).slice(0, 6);

  return (
    <>
      <section className="relative flex min-h-[520px] flex-col justify-end overflow-hidden bg-[#e9d5cf] md:min-h-[560px]">
        {config.bannerUrl ? (
          <Image
            src={config.bannerUrl}
            alt="Modelo usando short Espilicute"
            fill
            priority
            sizes="100vw"
            className="zoom-lento object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pb-40 md:justify-end md:pb-0 md:pr-[12%]">
            <ArteShort cor="#7a2346" largura={220} className="surgir opacity-90" />
          </div>
        )}
        <div className="relative bg-linear-to-b from-tinta/0 via-tinta/60 to-tinta/80 px-6 pb-8 pt-24 md:bg-linear-to-r md:from-tinta/75 md:via-tinta/40 md:to-tinta/0 md:py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-4">
            <h1 className="surgir surgir-1 max-w-md text-[30px] font-bold leading-tight text-white md:text-5xl">
              Seu estilo, suas regras. Seu momento,{" "}
              <span className="font-script text-[42px] font-normal md:text-[64px]">Espilicute.</span>
            </h1>
            <p className="surgir surgir-2 text-sm text-blush md:text-base">Shorts femininos que combinam com você.</p>
            <div className="surgir surgir-3 flex max-w-md gap-3">
              <Link
                href="/produtos"
                className="pressionar flex h-12 flex-1 items-center justify-center rounded-full bg-white text-[13px] font-bold tracking-wider text-vinho hover:bg-blush"
              >
                COMPRE AGORA
              </Link>
              <Link
                href="/produtos?novidades=1"
                className="pressionar flex h-12 flex-1 items-center justify-center rounded-full border-[1.5px] border-white text-[13px] font-bold tracking-wider text-white hover:bg-white/10"
              >
                VER NOVIDADES
              </Link>
            </div>
          </div>
        </div>
      </section>

      {estilos.length > 0 && (
        <Revelar como="section" className="mx-auto w-full max-w-6xl pt-8">
          <h2 className="mb-4 px-5 text-lg font-bold md:px-6">Compre por estilo</h2>
          <div className="sem-barra flex gap-3 overflow-x-auto px-5 pb-2 md:px-6">
            {estilos.map(([estilo, { hex, foto }]) => (
              <Link
                key={estilo}
                href={`/produtos?estilo=${encodeURIComponent(estilo)}`}
                className="group flex w-20 flex-none flex-col items-center gap-2"
              >
                <span
                  className="relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full ring-vinho/0 ring-offset-2 transition duration-300 group-hover:ring-2 group-hover:ring-vinho group-active:scale-95"
                  style={{ background: fundoClaro(hex) }}
                >
                  {foto ? (
                    <Image
                      src={foto}
                      alt=""
                      fill
                      sizes="72px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <ArteShort cor={hex} largura={40} className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
                  )}
                </span>
                <span className="text-center text-xs font-semibold">{estilo}</span>
              </Link>
            ))}
          </div>
        </Revelar>
      )}

      <section className="mx-auto w-full max-w-6xl px-5 pt-8 md:px-6">
        <Revelar className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Destaques</h2>
          <Link href="/produtos" className="text-[13px] font-semibold text-vinho underline-offset-4 hover:underline">
            Ver todos
          </Link>
        </Revelar>
        {destaques.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 md:gap-x-5">
            {destaques.map((p, i) => (
              <Revelar key={p.id} atraso={(i % 4) * 80}>
                <CartaoProduto produto={p} />
              </Revelar>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-blush p-6 text-center text-sm text-suave">Em breve, novidades por aqui.</p>
        )}
      </section>

      <section className="mx-auto mt-10 grid w-full max-w-6xl gap-4 px-5 md:grid-cols-3 md:px-6">
        {[
          {
            Icone: IconeConversa,
            titulo: "Pedido pelo WhatsApp",
            texto: "Monte a sacola e finalize falando direto com a gente.",
            href: null,
          },
          { Icone: IconeEntrega, titulo: "Entrega", texto: "Veja regiões, prazos e valores.", href: "/info/entrega" },
          { Icone: IconeTroca, titulo: "Trocas", texto: "Conheça nossa política de trocas.", href: "/info/trocas" },
        ].map(({ Icone, titulo, texto, href }, i) => (
          <Revelar
            key={titulo}
            atraso={i * 90}
            className="flex items-start gap-3 rounded-2xl bg-blush p-5 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-vinho">
              <Icone tamanho={20} />
            </span>
            <div>
              <p className="text-sm font-bold">{titulo}</p>
              <p className="text-[13px] leading-relaxed text-suave">
                {texto}{" "}
                {href && (
                  <Link href={href} className="font-semibold text-vinho underline">
                    Saiba mais
                  </Link>
                )}
              </p>
            </div>
          </Revelar>
        ))}
      </section>
    </>
  );
}
