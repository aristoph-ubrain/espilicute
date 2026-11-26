"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconeSacola } from "@/components/icones";
import { EVENTO_ADICIONADO, totalDeItens, useSacola } from "@/lib/sacola";

export function BotaoSacola() {
  const total = totalDeItens(useSacola());
  // Cada adição troca a chave do contador, o que reinicia a animação "pulo".
  const [pulos, setPulos] = useState(0);

  useEffect(() => {
    const aoAdicionar = () => setPulos((n) => n + 1);
    window.addEventListener(EVENTO_ADICIONADO, aoAdicionar);
    return () => window.removeEventListener(EVENTO_ADICIONADO, aoAdicionar);
  }, []);

  return (
    <Link
      href="/sacola"
      aria-label={total === 1 ? "Sacola, 1 item" : `Sacola, ${total} itens`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-blush"
    >
      <IconeSacola tamanho={21} />
      {total > 0 && (
        <span
          key={pulos}
          className={`absolute right-1 top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-vinho px-1 text-[10px] font-bold text-white ${pulos > 0 ? "pulo" : ""}`}
        >
          {total}
        </span>
      )}
    </Link>
  );
}
