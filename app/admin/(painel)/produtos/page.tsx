import Image from "next/image";
import Link from "next/link";
import { ArteShort } from "@/components/icones";
import { fundoClaro, estoqueTotal } from "@/components/loja/cartao-produto";
import { alternarAtivo } from "@/lib/actions/admin";
import { adminListarProdutos } from "@/lib/data";
import { formatarPreco, LIMITE_ULTIMAS_UNIDADES } from "@/lib/format";

export default async function ProdutosAdmin({ searchParams }: PageProps<"/admin/produtos">) {
  const [produtos, sp] = await Promise.all([adminListarProdutos(), searchParams]);
  const temExemplo = produtos.some((p) => p.exemplo);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="mt-1 text-[13px] text-suave">
            {produtos.length === 1 ? "1 produto" : `${produtos.length} produtos`}
            {temExemplo && " · os marcados como exemplo vieram do seed: edite ou exclua"}
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="flex h-11 items-center rounded-full bg-vinho px-5 text-[13px] font-bold text-white hover:bg-vinho-escuro"
        >
          + Novo produto
        </Link>
      </div>

      {sp.salvo && (
        <p role="status" className="rounded-lg bg-[#e5f0e6] px-4 py-3 text-[13px] font-semibold text-[#2f5e35]">
          Produto salvo.
        </p>
      )}

      {produtos.length === 0 ? (
        <div className="rounded-2xl border border-linha bg-white p-6 text-sm text-suave">
          Nenhum produto ainda. Cadastre o primeiro ou rode <code>npm run seed</code> para criar exemplos.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-linha bg-white">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[11px] tracking-[0.08em] text-suave">
                <th className="px-4 py-3.5 font-bold">PRODUTO</th>
                <th className="px-2 py-3.5 font-bold">PREÇO</th>
                <th className="px-2 py-3.5 font-bold">ESTOQUE</th>
                <th className="px-2 py-3.5 font-bold">STATUS</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => {
                const total = estoqueTotal(p);
                const cor = p.cores[0]?.hex ?? "#c9897b";
                return (
                  <tr key={p.id} className="border-t border-[#f2e8e5]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative flex h-[52px] w-11 flex-none items-center justify-center overflow-hidden rounded-lg"
                          style={{ background: fundoClaro(cor) }}
                        >
                          {p.imagens[0] ? (
                            <Image src={p.imagens[0]} alt="" fill sizes="44px" className="object-cover" />
                          ) : (
                            <ArteShort cor={cor} largura={30} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{p.nome}</span>
                          <span className="text-xs text-apagado">
                            {p.tamanhos.filter((t) => t.estoque > 0).map((t) => `${t.tamanho}:${t.estoque}`).join(" ") || "sem estoque"}
                            {p.exemplo && " · exemplo"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">{formatarPreco(p.preco)}</td>
                    <td className={`px-2 py-3 font-semibold ${total <= LIMITE_ULTIMAS_UNIDADES ? "text-alerta" : ""}`}>{total} un.</td>
                    <td className="px-2 py-3">
                      <form action={alternarAtivo}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          title={p.ativo ? "Clique para ocultar da loja" : "Clique para publicar"}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            p.ativo ? "bg-[#e5f0e6] text-[#2f5e35]" : "bg-[#efeae8] text-suave"
                          }`}
                        >
                          {p.ativo ? "Ativo" : "Oculto"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/produtos/${p.id}`}
                        className="inline-flex h-9 items-center rounded-full border border-borda px-3.5 text-xs font-semibold text-vinho hover:border-vinho"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
