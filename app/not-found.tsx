import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-[#2A2520] mb-4">404</p>
      <h1 className="text-xl font-bold text-[#F2EDE8] mb-2">Página não encontrada</h1>
      <p className="text-[#7A7570] text-sm mb-8">Essa camisa sumiu do cabide.</p>
      <Link
        href="/"
        className="bg-[#3DFF6E] text-[#0A0908] font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-[#2EDD58] transition-colors"
      >
        Voltar à galeria
      </Link>
    </main>
  )
}
