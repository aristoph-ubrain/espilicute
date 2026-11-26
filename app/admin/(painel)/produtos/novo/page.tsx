import Link from "next/link";
import { FormProduto } from "@/components/admin/form-produto";

export default function NovoProduto() {
  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <Link href="/admin/produtos" className="text-[13px] font-semibold text-vinho">
        ← Produtos
      </Link>
      <h1 className="text-2xl font-bold">Novo produto</h1>
      <FormProduto />
    </div>
  );
}
