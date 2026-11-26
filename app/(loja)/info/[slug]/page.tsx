import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getConfiguracoes } from "@/lib/data";
import { normalizarWhatsapp } from "@/lib/format";
import type { Configuracoes } from "@/lib/types";

const PAGINAS = {
  sobre: { titulo: "Sobre a Espilicute", campo: "sobre" },
  entrega: { titulo: "Política de entrega", campo: "entrega" },
  trocas: { titulo: "Trocas e devoluções", campo: "trocas" },
  privacidade: { titulo: "Política de privacidade", campo: "privacidade" },
  termos: { titulo: "Termos de uso", campo: "termos" },
  faq: { titulo: "Perguntas frequentes", campo: "faq" },
  contato: { titulo: "Contato", campo: null },
} satisfies Record<string, { titulo: string; campo: keyof Configuracoes | null }>;

type Slug = keyof typeof PAGINAS;

export function generateStaticParams() {
  return Object.keys(PAGINAS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/info/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pagina = PAGINAS[slug as Slug];
  return pagina ? { title: pagina.titulo } : {};
}

export default async function PaginaInfo({ params }: PageProps<"/info/[slug]">) {
  const { slug } = await params;
  const pagina = PAGINAS[slug as Slug];
  if (!pagina) notFound();
  const config = await getConfiguracoes();
  const texto = pagina.campo ? config[pagina.campo] : "";

  return (
    <article className="mx-auto w-full max-w-2xl px-5 pt-8 md:px-6">
      <h1 className="mb-5 text-2xl font-bold">{pagina.titulo}</h1>

      {slug === "contato" ? (
        <div className="flex flex-col gap-3 text-[15px] leading-relaxed">
          {config.whatsapp && (
            <p>
              WhatsApp:{" "}
              <a
                className="font-semibold text-vinho underline"
                href={`https://wa.me/${normalizarWhatsapp(config.whatsapp)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {config.whatsapp}
              </a>
            </p>
          )}
          {config.emailContato && (
            <p>
              E-mail:{" "}
              <a className="font-semibold text-vinho underline" href={`mailto:${config.emailContato}`}>
                {config.emailContato}
              </a>
            </p>
          )}
          {config.instagram && <p>Instagram: @{config.instagram.replace(/^@/, "")}</p>}
          {!config.whatsapp && !config.emailContato && !config.instagram && <EmBreve />}
        </div>
      ) : texto ? (
        <div className="whitespace-pre-line text-[15px] leading-relaxed text-suave">{texto}</div>
      ) : (
        <EmBreve />
      )}

      <Link href="/produtos" className="mt-8 inline-block text-sm font-semibold text-vinho underline">
        Ver os shorts
      </Link>
    </article>
  );
}

function EmBreve() {
  return <p className="rounded-2xl bg-blush p-5 text-sm text-suave">Esta informação será publicada em breve.</p>;
}
