const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formata centavos como R$ 0,00 */
export function formatarPreco(centavos: number) {
  return brl.format(centavos / 100);
}

/** Converte "89,90" / "89.90" / "R$ 1.089,90" em centavos. Retorna null se inválido. */
export function lerPreco(valor: string): number | null {
  const limpo = valor.replace(/[^\d,.-]/g, "").trim();
  if (!limpo) return null;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const n = Number(normalizado);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function centavosParaCampo(centavos: number | null) {
  if (centavos == null) return "";
  return (centavos / 100).toFixed(2).replace(".", ",");
}

export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** Mantém só dígitos; acrescenta 55 se parecer um número brasileiro sem DDI. */
export function normalizarWhatsapp(numero: string) {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return "55" + digitos;
  return digitos;
}

export function linkWhatsapp(numero: string, mensagem: string) {
  return `https://wa.me/${normalizarWhatsapp(numero)}?text=${encodeURIComponent(mensagem)}`;
}

export function formatarData(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Fortaleza",
  }).format(new Date(iso));
}

export const LIMITE_ULTIMAS_UNIDADES = 2;
