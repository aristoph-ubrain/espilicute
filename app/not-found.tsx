import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="font-script text-6xl text-vinho">Espilicute</span>
      <h1 className="text-xl font-bold">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-suave">O link pode ter mudado ou o produto não está mais disponível.</p>
      <Link href="/produtos" className="flex h-12 items-center rounded-full bg-vinho px-6 text-[13px] font-bold tracking-wider text-white">
        VER SHORTS
      </Link>
    </main>
  );
}
