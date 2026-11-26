"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const ITENS = [
  { href: "/admin/produtos", rotulo: "Produtos" },
  { href: "/admin/pedidos", rotulo: "Pedidos" },
  { href: "/admin/configuracoes", rotulo: "Configurações" },
];

/** O caminho atual só existe em tempo de execução: o menu sem destaque entra no shell estático. */
export function NavAdmin() {
  return (
    <Suspense fallback={<Menu caminho={null} />}>
      <MenuComCaminho />
    </Suspense>
  );
}

function MenuComCaminho() {
  return <Menu caminho={usePathname()} />;
}

function Menu({ caminho }: { caminho: string | null }) {
  return (
    <nav aria-label="Painel" className="flex gap-1.5 overflow-x-auto md:flex-col">
      {ITENS.map((i) => {
        const ativo = caminho?.startsWith(i.href) ?? false;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={ativo ? "page" : undefined}
            className={`flex h-11 flex-none items-center rounded-lg px-3 text-sm font-semibold ${
              ativo ? "bg-vinho text-white" : "text-[#e6d3ce] hover:bg-white/10"
            }`}
          >
            {i.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
