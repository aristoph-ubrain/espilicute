import { connection } from "next/server";
import { FormConfiguracoes } from "@/components/admin/form-configuracoes";
import { getDb } from "@/lib/db";
import { CONFIG_PADRAO, type Configuracoes } from "@/lib/types";

async function lerConfiguracoesAtuais(): Promise<Configuracoes> {
  await connection();
  const db = await getDb();
  const doc = await db.collection<{ _id: string } & Partial<Configuracoes>>("configuracoes").findOne({ _id: "loja" });
  const atual = { ...CONFIG_PADRAO };
  if (doc) {
    for (const k of Object.keys(CONFIG_PADRAO) as (keyof Configuracoes)[]) {
      if (typeof doc[k] === "string") atual[k] = doc[k];
    }
  }
  return atual;
}

export default async function ConfiguracoesAdmin() {
  const config = await lerConfiguracoesAtuais();
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Configurações da loja</h1>
        <p className="mt-1 text-[13px] text-suave">Esses dados aparecem no site. Deixe em branco o que ainda não estiver definido.</p>
      </div>
      <FormConfiguracoes config={config} />
    </div>
  );
}
