import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { COOKIE_SESSAO, tokenValido } from "./auth";

/** Use no topo de cada Server Action e página do painel. Redireciona para o login se não houver sessão. */
export async function exigirAdmin() {
  // A validade do login depende da hora atual (Date.now): isso só pode rodar no momento do acesso,
  // nunca numa pré-renderização (com Partial Prefetching os cookies existem também no prefetch).
  await connection();
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!(await tokenValido(token))) redirect("/admin/login");
}
