"use client";

import Link from "next/link";
import { IconeSacola } from "@/components/icones";
import { totalDeItens, useSacola } from "@/lib/sacola";

export function BotaoSacola() {
  const total = totalDeItens(useSacola());
  return (
    <Link
      href="/sacola"
      aria-label={total === 1 ? "Sacola, 1 item" : `Sacola, ${total} itens`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-blush"
    >
      <IconeSacola tamanho={21} />
      {total > 0 && (
        <span className="absolute right-1 top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-vinho px-1 text-[10px] font-bold text-white">
          {total}
        </span>
      )}
    </Link>
  );
}
