import Link from "next/link";
import { getConfiguracoes } from "@/lib/data";
import { IconeInstagram } from "@/components/icones";

const LINKS = [
  { href: "/info/sobre", rotulo: "Sobre" },
  { href: "/info/trocas", rotulo: "Trocas e devoluções" },
  { href: "/info/entrega", rotulo: "Entrega" },
  { href: "/info/privacidade", rotulo: "Privacidade" },
  { href: "/info/faq", rotulo: "Perguntas frequentes" },
  { href: "/info/termos", rotulo: "Termos de uso" },
  { href: "/info/contato", rotulo: "Contato" },
];

export async function Rodape() {
  const config = await getConfiguracoes();
  const instagram = config.instagram.replace(/^@/, "");
  return (
    <footer className="mt-16 bg-tinta text-blush">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 md:flex-row md:justify-between md:px-6">
        <div className="flex flex-col gap-3">
          <span className="font-script text-[42px] leading-none">Espilicute</span>
          <span className="text-xs font-semibold tracking-[0.35em]">MODA FEMININA</span>
          {instagram && (
            <a
              href={`https://instagram.com/${instagram}`}
              className="mt-2 inline-flex items-center gap-2 text-sm hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              <IconeInstagram tamanho={18} /> @{instagram}
            </a>
          )}
        </div>
        <nav aria-label="Institucional" className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm md:grid-cols-3">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:underline">
              {l.rotulo}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-[11px] leading-relaxed text-[#c9b8b3]">
        {config.razaoSocial || config.cnpj
          ? [config.razaoSocial, config.cnpj && `CNPJ ${config.cnpj}`].filter(Boolean).join(" · ")
          : "Espilicute"}
      </div>
    </footer>
  );
}

export async function AvisoTopo() {
  const { avisoTopo } = await getConfiguracoes();
  if (!avisoTopo) return null;
  return <div className="bg-vinho px-4 py-2 text-center text-xs font-medium text-blush">{avisoTopo}</div>;
}
