import type { Metadata } from "next";
import { FormLogin } from "./form-login";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default function Login() {
  return (
    <main className="flex flex-1 items-center justify-center bg-fundo-admin px-5 py-16">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-linha bg-white p-7">
        <div className="text-center">
          <span className="font-script text-5xl leading-none text-vinho">Espilicute</span>
          <h1 className="mt-3 text-sm font-semibold tracking-[0.2em] text-suave">PAINEL DA LOJA</h1>
        </div>
        <FormLogin />
      </div>
    </main>
  );
}
