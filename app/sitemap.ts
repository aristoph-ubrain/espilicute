import type { MetadataRoute } from "next";
import { getProdutosAtivos } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const produtos = await getProdutosAtivos();
  const fixas = ["", "/produtos", "/info/sobre", "/info/entrega", "/info/trocas", "/info/faq", "/info/contato"];
  return [
    ...fixas.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...produtos.map((p) => ({ url: `${base}/produtos/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
