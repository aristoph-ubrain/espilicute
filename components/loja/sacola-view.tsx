"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArteShort, IconeConversa, IconeFechar } from "@/components/icones";
import { criarPedido } from "@/lib/actions/pedido";
import { formatarPreco } from "@/lib/format";
import { alterarQtd, limparSacola, removerItem, totalDeItens, useSacola } from "@/lib/sacola";

export function SacolaView() {
  const itens = useSacola();
  const [nome, setNome] = useState("");
  const [local, setLocal] = useState("");
  const [entrega, setEntrega] = useState<"entrega" | "retirada">("entrega");
  const [erro, setErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<{ numero: number; url: string } | null>(null);
  const [enviando, iniciar] = useTransition();

  const total = totalDeItens(itens);
  const subtotal = itens.reduce((s, i) => s + i.preco * i.qtd, 0);

  const previa = [
    `Olá, Espilicute! Sou ${nome.trim() || "[seu nome]"} e quero fazer este pedido:`,
    ...itens.map((i) => `• ${i.qtd}x ${i.nome} — ${i.cor}, tam. ${i.tamanho}`),
    "",
    `Subtotal: ${formatarPreco(subtotal)}`,
    entrega === "entrega" ? `Entrega em: ${local.trim() || "[bairro e cidade]"}` : "Vou retirar o pedido",
  ].join("\n");

  function finalizar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const r = await criarPedido({
        itens: itens.map((i) => ({ produtoId: i.produtoId, cor: i.cor, tamanho: i.tamanho, qtd: i.qtd })),
        nome,
        local,
        entrega,
      });
      if (!r.ok) {
        setErro(r.erro);
        return;
      }
      limparSacola();
      setConfirmado({ numero: r.numero, url: r.whatsappUrl });
      window.location.assign(r.whatsappUrl);
    });
  }

  if (confirmado) {
    return (
      <div className="surgir mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl bg-blush p-8 text-center">
        <h1 className="text-xl font-bold">Pedido #{confirmado.numero} registrado!</h1>
        <p className="text-sm leading-relaxed text-suave">
          Estamos abrindo o WhatsApp com a mensagem pronta. É só enviar para combinarmos pagamento e entrega.
        </p>
        <a
          href={confirmado.url}
          className="flex h-12 items-center gap-2 rounded-full bg-vinho px-6 text-[13px] font-bold tracking-wider text-white"
        >
          <IconeConversa tamanho={18} /> ABRIR WHATSAPP
        </a>
        <Link href="/produtos" className="text-[13px] font-semibold text-vinho underline">
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[22px] font-bold">
        Sua sacola{" "}
        <span className="text-sm font-medium text-apagado">({total === 1 ? "1 item" : `${total} itens`})</span>
      </h1>

      {itens.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-blush px-5 py-8 text-center">
          <p className="text-[15px] font-semibold">Sua sacola está vazia</p>
          <Link
            href="/produtos"
            className="flex h-12 items-center rounded-full bg-vinho px-6 text-[13px] font-bold tracking-wider text-white"
          >
            VER SHORTS
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_340px] md:items-start md:gap-8">
          <ul className="flex flex-col">
            {itens.map((i) => (
              <li key={`${i.produtoId}-${i.cor}-${i.tamanho}`} className="surgir flex gap-3.5 border-b border-linha py-4">
                <Link
                  href={`/produtos/${i.slug}`}
                  className="relative flex h-[116px] w-[92px] flex-none items-center justify-center overflow-hidden rounded-xl bg-blush"
                >
                  {i.imagem ? (
                    <Image src={i.imagem} alt={i.nome} fill sizes="92px" className="object-cover" />
                  ) : (
                    <ArteShort cor={i.corHex} largura={60} />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex justify-between gap-2">
                    <Link href={`/produtos/${i.slug}`} className="text-sm font-semibold leading-snug hover:underline">
                      {i.nome}
                    </Link>
                    <button
                      type="button"
                      aria-label={`Remover ${i.nome}`}
                      onClick={() => removerItem(i)}
                      className="-mr-3 -mt-3 flex h-11 w-11 flex-none items-center justify-center text-apagado hover:text-tinta"
                    >
                      <IconeFechar tamanho={18} />
                    </button>
                  </div>
                  <span className="text-xs text-apagado">
                    {i.cor} · Tam. {i.tamanho}
                  </span>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-full border-[1.5px] border-borda">
                      <button type="button" aria-label="Diminuir" onClick={() => alterarQtd(i, i.qtd - 1)} className="h-11 w-10 text-lg">
                        −
                      </button>
                      <span className="min-w-[18px] text-center text-sm font-bold">{i.qtd}</span>
                      <button type="button" aria-label="Aumentar" onClick={() => alterarQtd(i, i.qtd + 1)} className="h-11 w-10 text-lg">
                        +
                      </button>
                    </div>
                    <span className="text-[15px] font-bold text-vinho">{formatarPreco(i.preco * i.qtd)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={finalizar} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-suave">Subtotal</span>
                <strong>{formatarPreco(subtotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-suave">Frete</span>
                <span>combinado no WhatsApp</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-blush p-4">
              <p className="text-[15px] font-bold">Seus dados para o pedido</p>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-suave">
                Nome
                <input
                  required
                  minLength={2}
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="h-[46px] rounded-lg border border-borda bg-white px-3.5 text-sm text-tinta"
                />
              </label>
              <div className="flex flex-col gap-1.5 text-xs font-semibold text-suave">
                Receber por
                <div className="flex gap-2" role="radiogroup" aria-label="Forma de receber">
                  {(["entrega", "retirada"] as const).map((op) => (
                    <button
                      key={op}
                      type="button"
                      role="radio"
                      aria-checked={entrega === op}
                      onClick={() => setEntrega(op)}
                      className={`h-11 flex-1 rounded-lg border-[1.5px] text-[13px] font-semibold ${
                        entrega === op ? "border-vinho bg-vinho text-white" : "border-borda bg-white text-tinta"
                      }`}
                    >
                      {op === "entrega" ? "Entrega" : "Retirada"}
                    </button>
                  ))}
                </div>
              </div>
              {entrega === "entrega" && (
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-suave">
                  Bairro e cidade
                  <input
                    required
                    minLength={3}
                    autoComplete="address-level2"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Para calcularmos o frete"
                    className="h-[46px] rounded-lg border border-borda bg-white px-3.5 text-sm text-tinta"
                  />
                </label>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold tracking-[0.08em] text-suave">PRÉVIA DA MENSAGEM</span>
              <p className="whitespace-pre-line rounded-[14px_14px_14px_4px] bg-[#efe9e1] p-3.5 text-[13px] leading-relaxed">
                {previa}
              </p>
            </div>

            {erro && (
              <p role="alert" className="rounded-lg bg-[#fbe9e6] p-3 text-[13px] font-semibold text-alerta">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="pressionar flex h-[54px] items-center justify-center gap-2.5 rounded-full bg-vinho text-sm font-bold tracking-wide text-white hover:bg-vinho-escuro disabled:opacity-60"
            >
              <IconeConversa tamanho={20} />
              {enviando ? "REGISTRANDO PEDIDO…" : "FINALIZAR PELO WHATSAPP"}
            </button>
            <p className="-mt-2 text-center text-xs leading-relaxed text-apagado">
              Os valores são confirmados no pedido. Pagamento e frete são combinados pelo WhatsApp.
            </p>
            <Link href="/produtos" className="py-2 text-center text-[13px] font-semibold text-vinho">
              Continuar comprando
            </Link>
          </form>
        </div>
      )}
    </div>
  );
}
