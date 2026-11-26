"use client";

import { useState } from "react";

/** Exclusão em dois passos, sem diálogo do navegador. */
export function BotaoExcluir({ nome }: { nome: string }) {
  const [confirmar, setConfirmar] = useState(false);
  if (!confirmar) {
    return (
      <button type="button" onClick={() => setConfirmar(true)} className="text-[13px] font-semibold text-alerta underline">
        Excluir produto
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#fbe9e6] p-4 text-[13px]">
      <span>
        Excluir <strong>{nome}</strong> de vez? Para só tirar da loja, desmarque “Publicado na loja”.
      </span>
      <button type="submit" className="h-9 rounded-full bg-alerta px-4 font-bold text-white">
        Sim, excluir
      </button>
      <button type="button" onClick={() => setConfirmar(false)} className="h-9 px-2 font-semibold text-suave">
        Cancelar
      </button>
    </div>
  );
}
