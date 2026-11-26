"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/admin/produtos", rotulo: "Produtos" },
  { href: "/admin/pedidos", rotulo: "Pedidos" },
  { href: "/admin/configuracoes", rotulo: "Configurações" },
];

export function NavAdmin() {
  const caminho = usePathname();
  return (
    <nav aria-label="Painel" className="flex gap-1.5 overflow-x-auto md:flex-col">
      {ITENS.map((i) => {
        const ativo = caminho.startsWith(i.href);
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
