"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, DURACAO_SESSAO_S, criarToken, senhaConfere } from "@/lib/auth";

export type EstadoLogin = { erro: string | null };

export async function entrar(_anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return { erro: "Painel não configurado: defina ADMIN_PASSWORD e SESSION_SECRET." };
  }
  const senha = String(formData.get("senha") ?? "");
  if (!(await senhaConfere(senha))) {
    return { erro: "Senha incorreta." };
  }
  const token = await criarToken();
  if (!token) return { erro: "SESSION_SECRET precisa ter pelo menos 16 caracteres." };
  (await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_SESSAO_S,
  });
  redirect("/admin/produtos");
}

export async function sair() {
  (await cookies()).delete(COOKIE_SESSAO);
  redirect("/admin/login");
}
