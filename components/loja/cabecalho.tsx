import Link from "next/link";
import { IconeBusca } from "@/components/icones";
import { BotaoSacola } from "./botao-sacola";
import { MenuMovel } from "./menu-movel";

export const LINKS_MENU = [
  { href: "/", rotulo: "Página inicial" },
  { href: "/produtos", rotulo: "Shorts" },
  { href: "/produtos?ordem=novidades", rotulo: "Novidades" },
  { href: "/info/sobre", rotulo: "Sobre a Espilicute" },
  { href: "/info/trocas", rotulo: "Trocas e devoluções" },
  { href: "/info/contato", rotulo: "Contato" },
];

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-30 border-b border-linha bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-2 md:px-6">
        <div className="flex items-center md:w-64">
          <MenuMovel links={LINKS_MENU} />
          <nav aria-label="Principal" className="hidden gap-6 text-sm font-semibold md:flex">
            <Link href="/" className="hover:text-vinho">
              Início
            </Link>
            <Link href="/produtos" className="hover:text-vinho">
              Shorts
            </Link>
            <Link href="/produtos?ordem=novidades" className="hover:text-vinho">
              Novidades
            </Link>
          </nav>
        </div>
        <Link href="/" className="font-script text-[38px] leading-none text-vinho" aria-label="Espilicute — início">
          Espilicute
        </Link>
        <div className="flex items-center justify-end md:w-64">
          <Link
            href="/produtos#busca"
            aria-label="Buscar"
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-blush"
          >
            <IconeBusca tamanho={21} />
          </Link>
          <BotaoSacola />
        </div>
      </div>
    </header>
  );
}
