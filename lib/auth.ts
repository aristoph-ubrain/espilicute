/**
 * Sessão simples do painel: cookie assinado com HMAC-SHA256 (Web Crypto),
 * funciona tanto no proxy quanto em Server Components e Server Actions.
 */
export const COOKIE_SESSAO = "esp_admin";
export const DURACAO_SESSAO_S = 60 * 60 * 24 * 7; // 7 dias

const encoder = new TextEncoder();

async function chave(): Promise<CryptoKey | null> {
  const segredo = process.env.SESSION_SECRET;
  if (!segredo || segredo.length < 16) return null;
  return crypto.subtle.importKey("raw", encoder.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function hex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function deHex(texto: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[0-9a-f]+$/.test(texto) || texto.length % 2) return null;
  const out = new Uint8Array(texto.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(texto.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export async function criarToken(): Promise<string | null> {
  const k = await chave();
  if (!k) return null;
  const expira = Math.floor(Date.now() / 1000) + DURACAO_SESSAO_S;
  const assinatura = await crypto.subtle.sign("HMAC", k, encoder.encode(`admin.${expira}`));
  return `${expira}.${hex(assinatura)}`;
}

export async function tokenValido(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expiraTxt, assinaturaHex] = token.split(".");
  const expira = Number(expiraTxt);
  if (!Number.isFinite(expira) || expira < Math.floor(Date.now() / 1000)) return false;
  const assinatura = deHex(assinaturaHex ?? "");
  const k = await chave();
  if (!assinatura || !k) return false;
  return crypto.subtle.verify("HMAC", k, assinatura, encoder.encode(`admin.${expira}`));
}

/** Compara a senha digitada com ADMIN_PASSWORD em tempo constante (via HMAC dos dois lados). */
export async function senhaConfere(digitada: string): Promise<boolean> {
  const correta = process.env.ADMIN_PASSWORD;
  const k = await chave();
  if (!correta || !k) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.sign("HMAC", k, encoder.encode(digitada)),
    crypto.subtle.sign("HMAC", k, encoder.encode(correta)),
  ]);
  const va = new Uint8Array(a);
  const vb = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}
