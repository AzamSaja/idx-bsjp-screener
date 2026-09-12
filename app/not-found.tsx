import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold font-mono mb-2">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-slate-400 text-sm mb-4">Halaman yang Anda cari tidak tersedia.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold font-mono text-white transition"
      >
        Kembali ke Terminal BSJP
      </Link>
    </div>
  );
}

