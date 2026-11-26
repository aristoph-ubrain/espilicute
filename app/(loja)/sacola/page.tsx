import type { Metadata } from "next";
import { SacolaView } from "@/components/loja/sacola-view";

export const metadata: Metadata = {
  title: "Sacola",
  robots: { index: false },
};

export default function Sacola() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-6 md:px-6">
      <SacolaView />
    </div>
  );
}
