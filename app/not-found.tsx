import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-10 text-center">
      <p className="font-mono text-[0.55rem] tracking-[0.35em] uppercase text-[#888] mb-4">404</p>
      <h1 className="font-display font-light text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-[-0.02em] text-[#1a1a1a] mb-6">
        Não<br/><em>encontrado</em>
      </h1>
      <p className="font-mono text-[0.65rem] text-[#888] mb-8">Essa camisa sumiu do cabide.</p>
      <Link
        href="/"
        className="font-mono text-[0.7rem] tracking-[0.1em] border border-[#1a1a1a] rounded-[2rem] px-5 py-2 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150"
      >
        Voltar à galeria
      </Link>
    </main>
  )
}
