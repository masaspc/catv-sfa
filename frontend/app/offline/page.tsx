'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // オンライン状態の監視
    const handleOnline = () => {
      setIsOnline(true)
      // オンラインに戻ったらダッシュボードにリダイレクト
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [router])

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/dashboard')
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-gray-600" />
          </div>
          <CardTitle className="text-2xl">
            {isOnline ? 'オンラインに戻りました' : 'オフラインです'}
          </CardTitle>
          <CardDescription>
            {isOnline
              ? 'まもなくダッシュボードに移動します...'
              : 'インターネット接続を確認してください'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOnline && (
            <>
              <p className="text-sm text-gray-600 text-center">
                一部のキャッシュされたデータは利用できる場合があります。
                インターネット接続が復旧したら、最新のデータが表示されます。
              </p>
              <Button
                onClick={handleRetry}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                再試行
              </Button>
            </>
          )}
          {isOnline && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
