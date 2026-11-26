"use client";

import { useEffect, useRef } from "react";

/**
 * Faz o conteúdo surgir suavemente ao entrar na tela.
 * O que já está visível no carregamento não anima, e sem JavaScript nada fica escondido.
 */
export function Revelar({
  children,
  atraso = 0,
  className,
  como: Tag = "div",
}: {
  children: React.ReactNode;
  atraso?: number;
  className?: string;
  como?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.dataset.revelar = "oculto";
    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          el.dataset.revelar = "visivel";
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLElement & HTMLLIElement>}
      data-revelar=""
      className={className}
      style={atraso ? { transitionDelay: `${atraso}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
