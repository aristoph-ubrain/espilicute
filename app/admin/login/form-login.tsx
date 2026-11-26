"use client";

import { useActionState } from "react";
import { entrar, type EstadoLogin } from "@/lib/actions/auth";

export function FormLogin() {
  const [estado, acao, pendente] = useActionState<EstadoLogin, FormData>(entrar, { erro: null });
  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-suave">
        Senha
        <input
          type="password"
          name="senha"
          required
          autoComplete="current-password"
          className="h-12 rounded-lg border border-borda px-3.5 text-sm text-tinta"
        />
      </label>
      {estado.erro && (
        <p role="alert" className="text-[13px] font-semibold text-alerta">
          {estado.erro}
        </p>
      )}
      <button
        type="submit"
        disabled={pendente}
        className="h-12 rounded-full bg-vinho text-[13px] font-bold tracking-wider text-white hover:bg-vinho-escuro disabled:opacity-60"
      >
        {pendente ? "ENTRANDO…" : "ENTRAR"}
      </button>
    </form>
  );
}
