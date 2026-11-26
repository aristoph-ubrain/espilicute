"use client";

import Link from "next/link";

export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-xl font-bold">Algo deu errado</h1>
      <p className="max-w-sm text-sm text-suave">Não conseguimos carregar esta página agora. Tente de novo em instantes.</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-12 rounded-full bg-vinho px-6 text-[13px] font-bold tracking-wider text-white"
        >
          TENTAR DE NOVO
        </button>
        <Link href="/" className="flex h-12 items-center rounded-full border-[1.5px] border-vinho px-6 text-[13px] font-bold text-vinho">
          INÍCIO
        </Link>
      </div>
    </main>
  );
}
