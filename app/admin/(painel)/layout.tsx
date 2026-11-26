import type { Metadata } from "next";
import { Suspense } from "react";
import { NavAdmin } from "./nav-admin";
import { sair } from "@/lib/actions/auth";
import { exigirAdmin } from "@/lib/sessao";
import { bancoConfigurado } from "@/lib/db";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-wrap bg-fundo-admin">
      <aside className="flex w-full flex-col gap-1.5 bg-tinta p-4 text-blush md:min-h-screen md:w-56 md:p-5">
        <span className="px-2.5 pb-3 font-script text-[40px] leading-none">Espilicute</span>
        <NavAdmin />
        <a href="/" target="_blank" rel="noopener noreferrer" className="mt-2 px-3 py-2 text-[13px] text-[#e6d3ce] hover:underline">
          Ver loja ↗
        </a>
        <form action={sair} className="md:mt-auto">
          <button type="submit" className="w-full rounded-lg px-3 py-2.5 text-left text-[13px] text-[#e6d3ce] hover:bg-white/10">
            Sair
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-[999_1_560px] p-5 md:p-8">
        <Suspense fallback={<p className="text-sm text-suave">Carregando…</p>}>
          <Protegido>{children}</Protegido>
        </Suspense>
      </div>
    </div>
  );
}

async function Protegido({ children }: { children: React.ReactNode }) {
  await exigirAdmin();
  if (!bancoConfigurado()) {
    return (
      <div className="max-w-lg rounded-2xl border border-linha bg-white p-6 text-sm leading-relaxed">
        <h1 className="mb-2 text-lg font-bold">Banco de dados não configurado</h1>
        Defina <code>MONGODB_URI</code> no arquivo <code>.env.local</code> (ou nas variáveis da Vercel) e reinicie o servidor.
      </div>
    );
  }
  return <>{children}</>;
}
