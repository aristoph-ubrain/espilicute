import Link from "next/link";
import { notFound } from "next/navigation";
import { FormProduto } from "@/components/admin/form-produto";
import { excluirProduto } from "@/lib/actions/admin";
import { adminGetProduto } from "@/lib/data";
import { BotaoExcluir } from "@/components/admin/botao-excluir";

export default async function EditarProduto({ params }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const produto = await adminGetProduto(id);
  if (!produto) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <Link href="/admin/produtos" className="text-[13px] font-semibold text-vinho">
        ← Produtos
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Editar produto</h1>
        {produto.ativo && (
          <Link href={`/produtos/${produto.slug}`} target="_blank" className="text-[13px] font-semibold text-vinho underline">
            Ver na loja ↗
          </Link>
        )}
      </div>
      <FormProduto produto={produto} />
      <form action={excluirProduto} className="border-t border-linha pt-5">
        <input type="hidden" name="id" value={produto.id} />
        <BotaoExcluir nome={produto.nome} />
      </form>
    </div>
  );
}
