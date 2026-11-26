"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { IconeUpload } from "@/components/icones";
import { enviarImagem } from "@/lib/actions/admin";

const LADO_MAX = 1600;

/** Redimensiona no navegador para caber no limite de upload e carregar rápido na loja. */
async function reduzir(arquivo: File): Promise<File> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
  if (!blob) return arquivo;
  return new File([blob], arquivo.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

/** Campo de fotos do produto. As URLs vão no formulário como inputs "imagens". */
export function EnvioImagens({ iniciais, nome = "imagens", maximo = 8 }: { iniciais: string[]; nome?: string; maximo?: number }) {
  const [urls, setUrls] = useState<string[]>(iniciais);
  const [enviando, setEnviando] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  async function aoEscolher(lista: FileList | null) {
    if (!lista?.length) return;
    setErro(null);
    const arquivos = Array.from(lista).slice(0, maximo - urls.length);
    setEnviando(arquivos.length);
    for (const arquivo of arquivos) {
      try {
        const dados = new FormData();
        dados.set("arquivo", await reduzir(arquivo));
        const r = await enviarImagem(dados);
        if (r.url) setUrls((u) => [...u, r.url!]);
        else setErro(r.erro ?? "Falha no envio.");
      } catch {
        setErro("Não foi possível enviar uma das fotos.");
      }
      setEnviando((n) => n - 1);
    }
    if (entrada.current) entrada.current.value = "";
  }

  const mover = (i: number, d: -1 | 1) =>
    setUrls((u) => {
      const j = i + d;
      if (j < 0 || j >= u.length) return u;
      const c = [...u];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-suave">Fotos (a primeira é a capa)</span>
      {urls.map((u) => (
        <input key={u} type="hidden" name={nome} value={u} />
      ))}
      <div className="flex flex-wrap gap-2">
        {urls.map((u, i) => (
          <div key={u} className="flex w-24 flex-col gap-1">
            <div className="relative h-28 w-24 overflow-hidden rounded-lg bg-blush">
              <Image src={u} alt={`Foto ${i + 1}`} fill sizes="96px" className="object-cover" />
            </div>
            <div className="flex justify-between text-xs">
              <button type="button" aria-label="Mover para a esquerda" onClick={() => mover(i, -1)} className="h-8 w-8 rounded hover:bg-blush">
                ←
              </button>
              <button
                type="button"
                aria-label={`Remover foto ${i + 1}`}
                onClick={() => setUrls((x) => x.filter((y) => y !== u))}
                className="h-8 px-1 font-semibold text-alerta"
              >
                Remover
              </button>
              <button type="button" aria-label="Mover para a direita" onClick={() => mover(i, 1)} className="h-8 w-8 rounded hover:bg-blush">
                →
              </button>
            </div>
          </div>
        ))}
        {urls.length < maximo && (
          <label className="flex h-28 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed border-[#d9c6c0] text-center text-[11px] text-apagado hover:border-vinho">
            <IconeUpload tamanho={20} />
            {enviando > 0 ? `Enviando ${enviando}…` : "Adicionar fotos"}
            <input
              ref={entrada}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={enviando > 0}
              onChange={(e) => aoEscolher(e.target.files)}
            />
          </label>
        )}
      </div>
      {erro && (
        <p role="alert" className="text-[13px] font-semibold text-alerta">
          {erro}
        </p>
      )}
    </div>
  );
}
