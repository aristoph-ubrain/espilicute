import Link from "next/link";
import { atualizarStatusPedido } from "@/lib/actions/admin";
import { adminListarPedidos } from "@/lib/data";
import { formatarData, formatarPreco } from "@/lib/format";
import { STATUS_LABEL, STATUS_PEDIDO, type StatusPedido } from "@/lib/types";

const TOM: Record<StatusPedido, string> = {
  novo: "bg-[#f5e4ea] text-vinho",
  confirmado: "bg-[#e6ecf3] text-[#34507a]",
  enviado: "bg-[#e5f0e6] text-[#2f5e35]",
  entregue: "bg-[#efeae8] text-suave",
  cancelado: "bg-[#fbe9e6] text-alerta",
};

export default async function PedidosAdmin({ searchParams }: PageProps<"/admin/pedidos">) {
  const sp = await searchParams;
  const filtro = STATUS_PEDIDO.find((s) => s === sp.status);
  const pedidos = await adminListarPedidos(filtro);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="mt-1 text-[13px] text-suave">
          Cada pedido enviado pelo WhatsApp fica registrado aqui. Ao cancelar, as peças voltam ao estoque.
        </p>
      </div>

      <nav aria-label="Filtrar por status" className="flex flex-wrap gap-2">
        {[undefined, ...STATUS_PEDIDO].map((s) => (
          <Link
            key={s ?? "todos"}
            href={s ? `/admin/pedidos?status=${s}` : "/admin/pedidos"}
            aria-current={filtro === s ? "page" : undefined}
            className={`flex h-9 items-center rounded-full border px-3.5 text-xs font-semibold ${
              filtro === s ? "border-vinho bg-vinho text-white" : "border-borda bg-white text-tinta"
            }`}
          >
            {s ? STATUS_LABEL[s] : "Todos"}
          </Link>
        ))}
      </nav>

      {pedidos.length === 0 ? (
        <div className="rounded-2xl border border-linha bg-white p-6 text-sm text-suave">Nenhum pedido por aqui ainda.</div>
      ) : (
        <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {pedidos.map((p) => (
            <article key={p.id} className="flex flex-col gap-2.5 rounded-2xl border border-linha bg-white p-4">
              <div className="flex items-center justify-between">
                <strong className="text-sm">Pedido #{p.numero}</strong>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${TOM[p.status]}`}>{STATUS_LABEL[p.status]}</span>
              </div>
              <p className="text-xs text-apagado">{formatarData(p.criadoEm)}</p>
              <p className="text-[13px] text-suave">
                {p.cliente.nome} · {p.entrega === "retirada" ? "retirada" : p.cliente.local}
              </p>
              <ul className="text-[13px] leading-relaxed">
                {p.itens.map((i, n) => (
                  <li key={n}>
                    {i.qtd}x {i.nome} ({i.cor}, {i.tamanho})
                  </li>
                ))}
              </ul>
              <p className="text-sm font-bold text-vinho">{formatarPreco(p.subtotal)}</p>
              <form action={atualizarStatusPedido} className="mt-auto flex items-end gap-2">
                <input type="hidden" name="id" value={p.id} />
                <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-suave">
                  Status
                  <select name="status" defaultValue={p.status} className="h-10 rounded-lg border border-borda bg-white px-2 text-[13px] text-tinta">
                    {STATUS_PEDIDO.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="h-10 rounded-full bg-vinho px-4 text-xs font-bold text-white">
                  Salvar
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
