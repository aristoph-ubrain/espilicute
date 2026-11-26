import { Cabecalho } from "@/components/loja/cabecalho";
import { AvisoTopo, Rodape } from "@/components/loja/rodape";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AvisoTopo />
      <Cabecalho />
      <main className="flex-1">{children}</main>
      <Rodape />
    </>
  );
}
