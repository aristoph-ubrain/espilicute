"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconeFechar, IconeMenu } from "@/components/icones";

export function MenuMovel({ links }: { links: { href: string; rotulo: string }[] }) {
  const [aberto, setAberto] = useState(false);
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    fecharRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={aberto}
        onClick={() => setAberto(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-blush"
      >
        <IconeMenu />
      </button>
      {/* Portal no <body>: o cabeçalho usa backdrop-blur, que prenderia o "fixed" dentro dele. */}
      {aberto &&
        createPortal(
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Fechar menu"
            className="aparecer absolute inset-0 bg-tinta/40"
            onClick={() => setAberto(false)}
          />
          <nav className="deslizar absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-script text-[34px] leading-none text-vinho">Espilicute</span>
              <button
                ref={fecharRef}
                type="button"
                aria-label="Fechar menu"
                onClick={() => setAberto(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-blush"
              >
                <IconeFechar />
              </button>
            </div>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setAberto(false)}
                className="border-b border-linha py-4 text-[15px] font-semibold"
              >
                {l.rotulo}
              </Link>
            ))}
          </nav>
        </div>,
          document.body,
        )}
    </div>
  );
}
