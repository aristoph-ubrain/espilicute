"use client";

import { startTransition, useActionState, useState } from "react";
import { salvarProduto, type EstadoForm } from "@/lib/actions/admin";
import { centavosParaCampo } from "@/lib/format";
import { TAMANHOS, type Cor, type Produto } from "@/lib/types";
import { EnvioImagens } from "./envio-imagens";

const campo = "h-11 rounded-lg border border-borda bg-white px-3 text-sm text-tinta";
const rotulo = "flex flex-col gap-1.5 text-xs font-semibold text-suave";

export function FormProduto({ produto }: { produto?: Produto }) {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(salvarProduto, { erro: null });
  const [cores, setCores] = useState<Cor[]>(produto?.cores.length ? produto.cores : [{ nome: "", hex: "#7a2346" }]);

  const mudarCor = (i: number, parte: Partial<Cor>) => setCores((cs) => cs.map((c, n) => (n === i ? { ...c, ...parte } : c)));

  return (
    <form
      onSubmit={(e) => {
        // Envia sem o reset automático do React, para não apagar o que foi digitado se houver erro.
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        startTransition(() => acao(dados));
      }}
      className="flex flex-col gap-5 rounded-2xl border border-linha bg-white p-5 md:p-6">
      {produto && <input type="hidden" name="id" value={produto.id} />}

      <EnvioImagens iniciais={produto?.imagens ?? []} />

      <label className={rotulo}>
        Nome do produto
        <input name="nome" required minLength={3} defaultValue={produto?.nome} placeholder="Ex.: Short Linho Areia" className={campo} />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={rotulo}>
          Preço (R$)
          <input name="preco" required inputMode="decimal" defaultValue={centavosParaCampo(produto?.preco ?? null)} placeholder="0,00" className={campo} />
        </label>
        <label className={rotulo}>
          Preço original (R$)
          <input
            name="precoOriginal"
            inputMode="decimal"
            defaultValue={centavosParaCampo(produto?.precoOriginal ?? null)}
            placeholder="Só se houver promoção"
            className={campo}
          />
        </label>
        <label className={rotulo}>
          Estilo
          <input name="estilo" defaultValue={produto?.estilo} placeholder="Ex.: Linho, Jeans" list="estilos" className={campo} />
          <datalist id="estilos">
            <option value="Linho" />
            <option value="Jeans" />
            <option value="Alfaiataria" />
            <option value="Moletom" />
          </datalist>
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-xs font-semibold text-suave">Cores</legend>
        <input type="hidden" name="cores" value={JSON.stringify(cores)} />
        {cores.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="color"
              value={c.hex}
              onChange={(e) => mudarCor(i, { hex: e.target.value })}
              aria-label={`Cor ${i + 1}`}
              className="h-11 w-12 flex-none cursor-pointer rounded-lg border border-borda bg-white p-1"
            />
            <input
              value={c.nome}
              onChange={(e) => mudarCor(i, { nome: e.target.value })}
              placeholder="Nome da cor (ex.: Vinho)"
              aria-label={`Nome da cor ${i + 1}`}
              className={`${campo} min-w-0 flex-1`}
            />
            {cores.length > 1 && (
              <button
                type="button"
                onClick={() => setCores((cs) => cs.filter((_, n) => n !== i))}
                className="h-11 px-3 text-[13px] font-semibold text-alerta"
              >
                Remover
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setCores((cs) => [...cs, { nome: "", hex: "#c9897b" }])}
          className="self-start text-[13px] font-semibold text-vinho underline"
        >
          + Adicionar cor
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-xs font-semibold text-suave">Estoque por tamanho</legend>
        <div className="grid grid-cols-5 gap-2">
          {TAMANHOS.map((t) => (
            <label key={t} className="flex flex-col items-center gap-1 text-[11px] font-semibold text-suave">
              {t}
              <input
                name={`estoque_${t}`}
                type="number"
                min={0}
                max={9999}
                inputMode="numeric"
                defaultValue={produto?.tamanhos.find((x) => x.tamanho === t)?.estoque ?? 0}
                className="h-10 w-full rounded-lg border border-borda text-center text-sm text-tinta"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-xs font-semibold text-suave">Etiquetas</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="novidade" defaultChecked={produto?.etiquetas.novidade} className="h-4 w-4 accent-vinho" /> Novidade
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="maisVendido" defaultChecked={produto?.etiquetas.maisVendido} className="h-4 w-4 accent-vinho" /> Mais vendido
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="oferta" defaultChecked={produto?.etiquetas.oferta} className="h-4 w-4 accent-vinho" /> Oferta
          </label>
        </div>
        <p className="text-xs leading-relaxed text-apagado">
          Use só quando for verdade. “Oferta” só aparece se houver preço original. “Últimas unidades” e “Esgotado” aparecem
          sozinhas conforme o estoque.
        </p>
      </fieldset>

      <label className={rotulo}>
        Descrição
        <textarea
          name="descricao"
          rows={4}
          defaultValue={produto?.descricao}
          placeholder="Caimento, ocasiões de uso, o que torna a peça especial"
          className="rounded-lg border border-borda px-3 py-2.5 text-sm text-tinta"
        />
      </label>
      <label className={rotulo}>
        Tecido e composição
        <textarea
          name="tecido"
          rows={2}
          defaultValue={produto?.tecido}
          placeholder="Ex.: 55% linho, 45% viscose. Lavar à mão."
          className="rounded-lg border border-borda px-3 py-2.5 text-sm text-tinta"
        />
      </label>

      <label className="flex items-center gap-2 text-[13px] font-semibold">
        <input type="checkbox" name="ativo" defaultChecked={produto ? produto.ativo : true} className="h-4 w-4 accent-vinho" />
        Publicado na loja
      </label>

      {estado.erro && (
        <p role="alert" className="rounded-lg bg-[#fbe9e6] p-3 text-[13px] font-semibold text-alerta">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="h-12 rounded-full bg-vinho text-[13px] font-bold tracking-wide text-white hover:bg-vinho-escuro disabled:opacity-60 sm:w-56"
      >
        {pendente ? "Salvando…" : "Salvar produto"}
      </button>
    </form>
  );
}
