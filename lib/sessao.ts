import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, tokenValido } from "./auth";

/** Use no topo de cada Server Action e página do painel. Redireciona para o login se não houver sessão. */
export async function exigirAdmin() {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!(await tokenValido(token))) redirect("/admin/login");
}
