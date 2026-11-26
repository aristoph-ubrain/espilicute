"use client";

import { startTransition, useActionState } from "react";
import { salvarConfiguracoes, type EstadoForm } from "@/lib/actions/admin";
import type { Configuracoes } from "@/lib/types";
import { EnvioImagens } from "./envio-imagens";

const campo = "h-11 rounded-lg border border-borda bg-white px-3 text-sm text-tinta";
const area = "rounded-lg border border-borda bg-white px-3 py-2.5 text-sm text-tinta";
const rotulo = "flex flex-col gap-1.5 text-xs font-semibold text-suave";

const TEXTOS: { k: keyof Configuracoes; titulo: string; dica: string }[] = [
  { k: "guiaMedidas", titulo: "Guia de medidas", dica: "Ex.: P — cintura 64–68 cm, quadril 92–96 cm…" },
  { k: "entrega", titulo: "Política de entrega", dica: "Regiões atendidas, prazos e valores de frete" },
  { k: "trocas", titulo: "Trocas e devoluções", dica: "Prazo e condições para troca" },
  { k: "sobre", titulo: "Sobre a Espilicute", dica: "A história e a proposta da marca" },
  { k: "faq", titulo: "Perguntas frequentes", dica: "Uma pergunta e resposta por parágrafo" },
  { k: "privacidade", titulo: "Política de privacidade", dica: "Como os dados das clientes são usados (LGPD)" },
  { k: "termos", titulo: "Termos de uso", dica: "" },
];

export function FormConfiguracoes({ config }: { config: Configuracoes }) {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(salvarConfiguracoes, { erro: null });

  return (
    <form
      onSubmit={(e) => {
        // Envia sem o reset automático do React, para não apagar o que foi digitado se houver erro.
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        startTransition(() => acao(dados));
      }}
      className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-linha bg-white p-5">
        <h2 className="text-[15px] font-bold">Atendimento</h2>
        <label className={rotulo}>
          WhatsApp que recebe os pedidos
          <input name="whatsapp" defaultValue={config.whatsapp} inputMode="tel" placeholder="(85) 99999-9999" className={campo} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={rotulo}>
            Instagram
            <input name="instagram" defaultValue={config.instagram} placeholder="@espilicute" className={campo} />
          </label>
          <label className={rotulo}>
            E-mail de contato
            <input name="emailContato" type="email" defaultValue={config.emailContato} className={campo} />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-linha bg-white p-5">
        <h2 className="text-[15px] font-bold">Página inicial</h2>
        <label className={rotulo}>
          Texto da barra de aviso (topo)
          <input name="avisoTopo" defaultValue={config.avisoTopo} className={campo} />
        </label>
        <EnvioImagens iniciais={config.bannerUrl ? [config.bannerUrl] : []} nome="bannerUrl" maximo={1} />
        <p className="-mt-2 text-xs text-apagado">Foto do banner principal (de preferência vertical para o celular).</p>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-linha bg-white p-5">
        <h2 className="text-[15px] font-bold">Dados da empresa</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={rotulo}>
            Razão social
            <input name="razaoSocial" defaultValue={config.razaoSocial} className={campo} />
          </label>
          <label className={rotulo}>
            CNPJ
            <input name="cnpj" defaultValue={config.cnpj} className={campo} />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-linha bg-white p-5">
        <h2 className="text-[15px] font-bold">Textos e políticas</h2>
        {TEXTOS.map((t) => (
          <label key={t.k} className={rotulo}>
            {t.titulo}
            <textarea name={t.k} rows={4} defaultValue={config[t.k]} placeholder={t.dica} className={area} />
          </label>
        ))}
      </section>

      {estado.erro && (
        <p role="alert" className="rounded-lg bg-[#fbe9e6] p-3 text-[13px] font-semibold text-alerta">
          {estado.erro}
        </p>
      )}
      {estado.ok && (
        <p role="status" className="rounded-lg bg-[#e5f0e6] p-3 text-[13px] font-semibold text-[#2f5e35]">
          Configurações salvas.
        </p>
      )}
      <button
        type="submit"
        disabled={pendente}
        className="h-12 rounded-full bg-vinho text-[13px] font-bold text-white hover:bg-vinho-escuro disabled:opacity-60 sm:w-56"
      >
        {pendente ? "Salvando…" : "Salvar configurações"}
      </button>
    </form>
  );
}
