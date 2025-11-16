import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          CATV SFA System
        </h1>
        <p className="text-xl text-center mb-8">
          CATV事業者向け営業支援システム
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ダッシュボード
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">営業活動管理</h3>
            <p className="text-sm text-gray-600">
              日報入力、訪問予定管理、顧客管理をモバイルで快適に
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">集合住宅特化</h3>
            <p className="text-sm text-gray-600">
              物件管理、提案支援、導入状況の可視化
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">データ分析</h3>
            <p className="text-sm text-gray-600">
              営業成績の可視化、KPIダッシュボード
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
